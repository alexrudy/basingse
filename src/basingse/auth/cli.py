import click
import structlog
from basingse import svcs
from flask.cli import AppGroup
from sqlalchemy import select
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session

from .models import User
from .permissions import Action
from .permissions import create_administrator
from .permissions import Role

auth_cli = AppGroup("auth", help="Tools for authentication")

log = structlog.get_logger(__name__)


def get_or_abort(session: Session, email: str) -> User:
    try:
        return session.execute(select(User).where(User.email == email)).scalar_one()
    except NoResultFound:
        log.exception("User not found!", email=email)
        click.echo(f"User {email!r} not found!", err=True)
        raise click.BadOptionUsage("email", f"User {email!r} not found!") from None


def get_role(session: Session, role: str) -> Role:
    try:
        return session.execute(select(Role).where(Role.name == role)).scalar_one()
    except NoResultFound:
        log.exception("Role not found!", role=role)
        raise click.BadOptionUsage("role", f"Role {role!r} not found!") from None


@auth_cli.command()
@click.option("--email", type=str, help="Email for the new user", required=True, prompt=True)
@click.password_option("--password", help="Password for the new user")
@click.option("--active/--inactive", default=True, help="Is this account active?")
@click.option("--role", help="Role for the new user", type=str, required=False)
@click.option("--display-name", help="Display name for the new user", type=str, required=False)
def new_user(email: str, password: str, active: bool, role: str | None, display_name: str | None) -> None:
    """Add a user to the authentication system."""
    session = svcs.get(Session)

    user = session.execute(select(User).where(User.email == email).limit(1)).scalar_one_or_none()
    if user is None:
        user = User(email=email)
        log.info("Creating user", user=user)
    else:
        log.info("Updating user", user=user)

    if role is not None:
        user.roles.append(get_role(session, role))

    user.active = active
    user.password = password

    session.add(user)
    session.commit()


@auth_cli.command()
@click.option("--email", type=str, help="Email for the user to change", prompt=True, required=True)
@click.option("--role", help="Role for the user", type=str, required=True, prompt=True)
def role(email: str, role: str) -> None:
    """Set a role for a user."""
    session = svcs.get(Session)

    user = get_or_abort(session, email)
    log.info("Updating user", user=user)

    user.roles.append(get_role(session, role))
    session.add(user)

    session.commit()


@auth_cli.command()
@click.option("--name", type=str, help="Name for the new role", required=True, prompt=True)
@click.option("--administrator/--not-administrator", default=False, help="Is this an administrator role?")
def new_role(name: str, administrator: bool) -> None:
    """Add a role to the authentication system."""
    session = svcs.get(Session)

    role = session.execute(select(Role).where(Role.name == name).limit(1)).scalar_one_or_none()
    if role is None:
        role = Role(name=name, administrator=administrator)
        log.info("Creating role", role=role)
    else:
        role.administrator = administrator
        log.info("Updating role", role=role)

    session.add(role)

    session.commit()


@auth_cli.command()
@click.option("--role", help="Role to grant permissions for", type=str, required=True, prompt=True)
@click.option("--model", help="Model to grant permissions for", type=str, required=True, prompt=True)
@click.option(
    "--permission",
    help="Permission to grant",
    type=click.Choice([permission.name.lower() for permission in Action]),
    required=True,
    prompt=True,
)
def grant(role: str, model: str, permission: str) -> None:
    """Grant a permission to a role."""
    session = svcs.get(Session)
    permission = Action[permission.upper()]

    role = get_role(session, role)

    log.info("Granting permission", role=role, model=model, permission=permission)
    role.grant(model, permission)

    session.commit()


@auth_cli.command()
@click.option("--email", type=str, help="Email for the user to activate", required=True, prompt=True)
@click.option("--active/--inactive", default=True, help="Is this account active?", prompt=True)
def activate(email: str, active: bool) -> None:
    """Activate or deactivate a user."""
    session = svcs.get(Session)

    user = get_or_abort(session, email)
    log.info("Updating user", user=user)

    user.active = active
    session.add(user)

    session.commit()


@auth_cli.command()
@click.option("--email", type=str, prompt=True, help="Email we want to log out")
def logout(email: str) -> None:
    """Log a user out of the web interface by resetting their token"""
    session = svcs.get(Session)
    user = get_or_abort(session, email)
    log.info("Resetting login token", user=user)
    user.reset_token()
    session.commit()


@auth_cli.command()
@click.option("--email", type=str, help="Email for the user to change", prompt=True, required=True)
@click.password_option(help="New password for the user")
def set_password(email: str, password: str) -> None:
    """Set a new password for a user."""
    session = svcs.get(Session)
    user = get_or_abort(session, email)
    log.info("Updating user", user=user)

    session.add(user)
    user.password = password

    session.commit()


@auth_cli.command()
@click.option("--email", type=str, help="Email for the user to delete", prompt=True)
@click.option("--yes", "confirm", is_flag=True, default=False, help="Don't prompt for input")
def delete_user(email: str, confirm: bool) -> None:
    """Delete a user and all associated data"""
    session = svcs.get(Session)

    user = get_or_abort(session, email)

    if confirm or click.confirm(f"Are you sure you want to delete {user}"):  # pragma: no cover
        log.info("Deleting user", user=user)
        session.delete(user)
        session.commit()


@auth_cli.command(name="list")
@click.option("--active/--inactive", default=None, help="Filter by active/inactive status")
@click.option("--role", type=str, help="Filter by role", required=False, prompt=False)
@click.option("--administrator/--not-administrator", default=None, help="Filter by administrator status")
def list_users(active: bool | None, role: str | None, administrator: bool | None) -> None:
    """List users"""
    session = svcs.get(Session)

    query = select(User).order_by(User.email)
    if active is not None:
        query = query.where(User.active == active)
    if role is not None:
        query = query.where(User.roles.contains(get_role(session, role)))
    if administrator is not None:
        query = query.join(User.roles).where(Role.administrator == administrator)

    for user in session.scalars(query):
        no_password = "(" + click.style("no password set", fg="yellow") + ")" if user.password is None else ""
        inactive = click.style("✓", fg="green") if user.active else click.style("𐄂", fg="red")

        if user.last_login_at is None:
            last_login = "(never logged in)"
        else:
            last_login = f"{user.last_login_at.astimezone():%Y/%m/%d %H:%M %Z}"

        roles = ",".join(
            click.style(role.name, fg="green") if role.administrator else role.name for role in user.roles
        ) or click.style("none", fg="yellow")
        click.echo(f"{user.email:<40.40s} {roles} {inactive} {no_password} {last_login}")


@auth_cli.command()
@click.option("--email", type=str, help="Email for the admin user", prompt=True, required=True)
@click.option("--password", help="Password for the admin user", prompt=True, hide_input=True, required=True)
def init(email: str, password: str) -> None:
    """Initialize the authentication system with an administrator user"""
    session = svcs.get(Session)
    user = create_administrator(email, password)
    if not user.is_administrator:
        click.echo("Administrator already exists!")
        role = session.execute(select(Role).where(Role.administrator).limit(1)).scalar_one()

        for administrator in role.users:
            click.echo(f"Administrator: {administrator.email}")

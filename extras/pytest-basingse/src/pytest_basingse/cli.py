from click.testing import Result as ClickResult


class Result:
    pass


class Success(Result):
    def __eq__(self, other: object) -> bool:  # pragma: nocover
        if isinstance(other, ClickResult):
            if other.exit_code == 0:
                return True
            print("Error: ")
            print(other.output)
        return NotImplemented

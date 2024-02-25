class HtmxProperties(dict):
    @property
    def attrs(self) -> dict[str, str]:
        return {f"hx-{key}": value for key, value in self.items()}

    def __str__(self) -> str:
        return " ".join(f"hx-{key}={value}" for key, value in self.items())

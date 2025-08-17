import json

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Access configs
    GEMINI_API_KEY: str = "AIzaSyCyt4Rso_qOufTu3JBjHUp4vBYGOpS8iY8"

    class Config:
        """
        Configs will be over-ridden by the following environment specific file
        """

        env_file = ".env"
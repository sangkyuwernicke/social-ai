from dataclasses import dataclass, field
from typing import List


@dataclass
class Persona:
    name: str
    age_range: str
    occupation: str
    interests: List[str]
    goals: List[str]
    pain_points: List[str]
    values: List[str]
    lifestyle: str

    def to_description(self) -> str:
        return "\n".join([
            f"페르소나: {self.name}",
            f"나이대: {self.age_range}",
            f"직업: {self.occupation}",
            f"관심사: {', '.join(self.interests)}",
            f"목표: {', '.join(self.goals)}",
            f"고민/문제: {', '.join(self.pain_points)}",
            f"가치관: {', '.join(self.values)}",
            f"라이프스타일: {self.lifestyle}",
        ])

    def to_image_prompt(self) -> str:
        interests_str = ", ".join(self.interests[:3])
        return (
            f"A beautiful Instagram lifestyle photo for a {self.age_range} {self.occupation}. "
            f"They love {interests_str}. Lifestyle: {self.lifestyle}. "
            f"Warm, authentic, aesthetic, high-quality photography. "
            f"Bright natural lighting, clean composition, Instagram-worthy."
        )

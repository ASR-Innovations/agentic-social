from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="ai-social-sdk",
    version="1.0.0",
    author="AI Social Media Platform",
    author_email="sdk-support@example.com",
    description="Official Python SDK for AI Social Media Management Platform",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/example/ai-social-sdk-python",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
    python_requires=">=3.8",
    install_requires=[
        "requests>=2.31.0",
        "typing-extensions>=4.0.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-cov>=4.0.0",
            "black>=23.0.0",
            "mypy>=1.0.0",
        ],
    },
    project_urls={
        "Bug Reports": "https://github.com/example/ai-social-sdk-python/issues",
        "Documentation": "https://docs.example.com/sdk/python",
        "Source": "https://github.com/example/ai-social-sdk-python",
    },
)

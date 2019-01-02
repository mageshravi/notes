FROM python:3.6.5-slim-stretch
ENV PYTHONBUFFERED 1
RUN mkdir /code
WORKDIR /code
ADD pip-requirements /code/
RUN pip install --upgrade pip && pip install -r pip-requirements
ADD . /code/

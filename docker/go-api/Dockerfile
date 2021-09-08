FROM golang:1.17rc2-alpine3.14
COPY . /go/src
RUN apk update
WORKDIR /go/src/cmd
CMD [ "go", "build" ]
CMD [ "go", "run", "main.go" ]
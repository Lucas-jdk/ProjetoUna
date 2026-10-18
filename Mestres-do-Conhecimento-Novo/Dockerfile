FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY backend ./backend
COPY frontend ./frontend
RUN mkdir -p out && javac -encoding UTF-8 -d out backend/Server.java
EXPOSE 8080
CMD ["java", "-cp", "out", "Server"]

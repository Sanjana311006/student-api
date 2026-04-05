const http = require("http");
const url = require("url");

let students = [];

function send(res, status, data) {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
}

function validate(data) {
    if (!data.name || !data.email || !data.course || !data.year) {
        return "All fields are required";
    }
    if (data.year < 1 || data.year > 4) {
        return "Year must be between 1 and 4";
    }
    return null;
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;

    // GET all
    if (req.method === "GET" && path === "/students") {
        return send(res, 200, students);
    }

    // GET one
    if (req.method === "GET" && path.startsWith("/students/")) {
        const id = path.split("/")[2];
        const student = students.find(s => s.id === id);

        if (!student) {
            return send(res, 404, { message: "Not found" });
        }

        return send(res, 200, student);
    }

    // POST
    if (req.method === "POST" && path === "/students") {
        let body = "";

        req.on("data", chunk => body += chunk);

        req.on("end", () => {
            const data = JSON.parse(body);

            const error = validate(data);
            if (error) {
                return send(res, 400, { message: error });
            }

            const student = {
                id: Date.now().toString(),
                ...data
            };

            students.push(student);
            return send(res, 201, student);
        });

        return;
    }

    // PUT
    if (req.method === "PUT" && path.startsWith("/students/")) {
        const id = path.split("/")[2];
        let body = "";

        req.on("data", chunk => body += chunk);

        req.on("end", () => {
            const data = JSON.parse(body);
            const student = students.find(s => s.id === id);

            if (!student) {
                return send(res, 404, { message: "Not found" });
            }

            Object.assign(student, data);
            return send(res, 200, student);
        });

        return;
    }

    // DELETE
    if (req.method === "DELETE" && path.startsWith("/students/")) {
        const id = path.split("/")[2];

        students = students.filter(s => s.id !== id);

        return send(res, 200, { message: "Deleted" });
    }

    send(res, 404, { message: "Route not found" });
});
server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
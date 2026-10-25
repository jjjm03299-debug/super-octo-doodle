const net = require('net');

// Use process.env.PORT if available, otherwise fallback to 5900
const PORT = process.env.PORT || 5900;

// Create the TCP server daemon
const server = net.createServer((socket) => {
  console.log(`[Daemon] Client connected: ${socket.remoteAddress}:${socket.remotePort}`);

  // Handle incoming data streams over TCP
  socket.on('data', (data) => {
    const requestString = data.toString().trim();
    console.log(`[Daemon] Received request:\n${requestString}`);

    // Simple parsing to find the requested path/endpoint from a standard text or HTTP-like request line
    const firstLine = requestString.split('\n')[0] || '';
    
    // Check if the request targets /api/get-ram
    if (firstLine.includes('/api/get-ram')) {
      const jsonResponse = JSON.stringify({ ram_mb: 1024 });

      // Simulated HTTP-style response over raw TCP with headers
      const rawHttpTcpResponse = 
        "HTTP/1.1 200 OK\r\n" +
        "Content-Type: application/json\r\n" +
        `Content-Length: ${Buffer.byteLength(jsonResponse)}\r\n` +
        "\r\n" + 
        jsonResponse;

      socket.write(rawHttpTcpResponse);
    } else {
      // Handle unknown paths
      const errorResponse = JSON.stringify({ error: "Not Found" });
      socket.write("HTTP/1.1 404 Not Found\r\nContent-Type: application/json\r\n\r\n" + errorResponse);
    }

    // Close the socket after sending response
    socket.end();
  });

  socket.on('end', () => {
    console.log('[Daemon] Client disconnected.');
  });

  socket.on('error', (err) => {
    console.error(`[Daemon Error]: ${err.message}`);
  });
});

// Start listening on the designated port
server.listen(PORT, () => {
  console.log(`[Daemon] TCP server running and listening on port ${PORT}`);
});

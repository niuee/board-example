let portToA: MessagePort;
onmessage = (evt) => {
    // Perform some drawing using the gl context
    if (evt.data.port) {
        console.log("Worker A received port");
        // Store the port

        portToA = evt.data.port;
        
        // Listen for messages on the port
        portToA.onmessage = function(event) {
            console.log('Worker A received:', event.data);
            
            // Send a reply
            portToA.postMessage('Hello back from Worker A');
        };
        portToA.postMessage("Hello from Worker A");
    }
};

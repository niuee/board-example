let portToB: MessagePort;
onmessage = function(event) {
    if (event.data.port) {
        // Store the port
        portToB = event.data.port;
        
        // Listen for messages on the port
        portToB.onmessage = function(event) {
            console.log('Worker B received:', event.data);
        };
    }
};
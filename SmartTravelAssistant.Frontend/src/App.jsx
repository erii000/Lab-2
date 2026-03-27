import { useEffect, useState } from "react";

function App() {
    const [status, setStatus] = useState(null);

    useEffect(() => {
        fetch("http://localhost:5161/api/status")
            .then(res => res.json())
            .then(data => setStatus(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <h1>Smart Travel Assistant</h1>

            {status ? (
                <div>
                    <p>{status.message}</p>
                    <p>{status.time}</p>
                </div>
            ) : (
                <p>Loading backend...</p>
            )}
        </div>
    );
}

export default App;
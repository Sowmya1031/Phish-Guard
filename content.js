// Function to analyze phishing risk and handle fallback notification
(function() {
    const analyzePhishingRisk = async (inputData) => {
        console.log("Prepared Input Data for Analysis:", JSON.stringify(inputData, null, 2)); 
        try {
            const response = await fetch('http://127.0.0.1:8000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(inputData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Server Prediction Result:", result);
            displayResult(result.prediction);
        } catch (error) {
            console.error("Error during phishing analysis:", error);
        }
    };

    const displayResult = (prediction) => {
        const resultDiv = document.createElement('div');
        resultDiv.style.position = 'fixed';
        resultDiv.style.top = '20px';
        resultDiv.style.right = '20px';
        resultDiv.style.width = '250px';
        resultDiv.style.color = prediction === "phishy" ? 'white' : 'green';
        resultDiv.style.textAlign = 'center';
        resultDiv.style.padding = '10px';
        resultDiv.style.zIndex = '9999';
        resultDiv.style.borderRadius = '8px';
        resultDiv.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)';

        if (prediction === "phishy") {
            resultDiv.style.backgroundColor = "rgba(255, 0, 0, 0.8)";
            resultDiv.textContent = "⚠️ Warning: This site may be phishing!";
        } else {
            resultDiv.style.backgroundColor = "#f5f5dc";
            resultDiv.textContent = "✅ This site appears legitimate.";
        }

        document.body.appendChild(resultDiv);

        setTimeout(() => {
            document.body.removeChild(resultDiv);
        }, 5000);
    };

    const gatherInputData = () => {
        const data = {
            SFH: getSFHValue(),
            popUpWindow: getPopUpWindowValue(),
            SSLfinal_State: getSSLFinalState(),
            Request_URL: getRequestURLValue(),
            URL_of_Anchor: getURLofAnchorValue(),
            web_traffic: getWebTrafficValue(),
            URL_Length: getURLLengthValue(),
            age_of_domain: getAgeOfDomainValue(),
            having_IP_Address: getHavingIPAddressValue()
        };

        console.log("Feature Values for Analysis:");
        for (const [feature, value] of Object.entries(data)) {
            console.log(`${feature}: ${value}`);
        }
        return data;
    };

    function getSFHValue() {
        const forms = document.querySelectorAll('form');
        if (forms.length === 0) return 0;
        for (let form of forms) {
            if (form.action && (form.action.startsWith('https://') && form.action.includes(window.location.hostname))) {
                return 1;
            }
        }
        return 0;
    }

    function getPopUpWindowValue() { 
        return 0; 
    }

    function getSSLFinalState() {
        return window.location.protocol === 'https:' ? 2 : 0;
    }

    function getRequestURLValue() {
        const links = document.querySelectorAll('a');
        let externalLinkCount = 0;
        links.forEach(link => {
            if (link.href && !link.href.includes(window.location.hostname) && link.href.startsWith('http')) {
                externalLinkCount++;
            }
        });
        console.log("External Links Count:", externalLinkCount, "/", links.length);
        return externalLinkCount / links.length > 0.2 ? 1 : 0;
    }

    function getURLofAnchorValue() {
        const anchors = document.querySelectorAll('a');
        let externalCount = 0;
        if (anchors.length === 0) return 0;

        anchors.forEach(anchor => {
            if (anchor.href && !anchor.href.includes(window.location.hostname) && anchor.href.startsWith('http')) {
                externalCount++;
            }
        });
        console.log("External Anchors Count:", externalCount, "/", anchors.length);
        return externalCount / anchors.length > 0.3 ? 1 : 0;
    }

    function getWebTrafficValue() {
        console.log("Placeholder Web Traffic Value: 0.2");
        return 0.2; // Placeholder, adjust if real traffic data can be integrated
    }

    function getURLLengthValue() {
        const url = window.location.href;
        console.log("URL Length:", url.length);
        return url.length > 60 ? 1 : 0;
    }

    function getAgeOfDomainValue() {
        console.log("Placeholder Domain Age Value: 1.0");
        return 1.0; // Placeholder, adjust if actual domain age can be checked
    }

    function getHavingIPAddressValue() {
        const hostname = window.location.hostname;
        const ipPattern = /^(?:\d{1,3}\.){3}\d{1,3}$/;
        const hasIPAddress = ipPattern.test(hostname) ? 1 : 0;
        console.log("IP Address Check:", hasIPAddress);
        return hasIPAddress;
    }

    const inputData = gatherInputData();
    analyzePhishingRisk(inputData);
})();

// Listen for navigation errors and handle blocked/insecure sites
chrome.webNavigation.onErrorOccurred.addListener((details) => {
    if (details.frameId === 0) {
        console.log("Navigation error detected:", details);
        if (details.error.includes("net::ERR_BLOCKED_BY_CLIENT") || details.error.includes("net::ERR_INSECURE_RESPONSE")) {
            // Show a fallback notification for a blocked or insecure site
            chrome.notifications.create({
                type: "basic",
                iconUrl: "icon.png",
                title: "Phishing Alert",
                message: "The site you attempted to visit has been flagged as potentially dangerous."
            });
        }
    }
});

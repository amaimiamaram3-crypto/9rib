
import { db } from "./firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");
const serviceDetails = document.getElementById("serviceDetails");

const params = new URLSearchParams(window.location.search);
const serviceId = params.get("id");

const icons = {
    "Santé": "🏥",
    "Maison": "🏠",
    "Commerce": "🛍️",
    "Éducation": "📚",
    "Transport": "🚕",
    "Beauté": "💇",
    "Autre": "📍"
};

function showError() {
    loadingMessage.hidden = true;
    serviceDetails.hidden = true;
    errorMessage.hidden = false;
}

async function loadServiceDetails() {
    if (!serviceId) {
        showError();
        return;
    }

    try {
        const serviceRef = doc(db, "providers", serviceId);
        const serviceSnapshot = await getDoc(serviceRef);

        if (!serviceSnapshot.exists()) {
            showError();
            return;
        }

        const service = serviceSnapshot.data();

        document.getElementById("serviceName").textContent =
            service.businessName || "Sans nom";

        document.getElementById("serviceCategory").textContent =
            service.category || "Autre";

        document.getElementById("serviceIcon").textContent =
            icons[service.category] || "📍";

        document.getElementById("serviceLocation").textContent =
            [service.delegation, service.governorate]
                .filter(Boolean)
                .join(", ") || "Localisation non précisée";

        document.getElementById("serviceOwner").textContent =
            service.ownerName || "Non précisé";

        document.getElementById("serviceType").textContent =
            service.serviceType || "Non précisé";

        document.getElementById("serviceAddress").textContent =
            service.address || "Non précisée";

        document.getElementById("serviceGovernorate").textContent =
            service.governorate || "Non précisé";

        document.getElementById("serviceDelegation").textContent =
            service.delegation || "Non précisée";

        document.getElementById("servicePhone").textContent =
            service.phone || "Non précisé";

        // Bouton pour appeler
        const callButton = document.getElementById("callButton");

        if (service.phone) {
            callButton.href = "tel:" + service.phone;
            callButton.hidden = false;
        } else {
            callButton.hidden = true;
        }

        // Emplacement GPS sur Google Maps
        const mapRow = document.getElementById("mapRow");
        const mapButton = document.getElementById("mapButton");

        if (
            typeof service.lat === "number" &&
            typeof service.lon === "number"
        ) {
            mapButton.href =
                `https://www.google.com/maps?q=${service.lat},${service.lon}`;

            mapRow.hidden = false;
        } else {
            mapRow.hidden = true;
        }

        loadingMessage.hidden = true;
        errorMessage.hidden = true;
        serviceDetails.hidden = false;

    } catch (error) {
        console.error("Erreur Firebase :", error);
        showError();
    }
}

loadServiceDetails();

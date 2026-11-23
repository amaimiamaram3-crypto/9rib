

import { db } from "./firebase.js";
import { regions } from "./regions.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// HTML elements
const form = document.getElementById("providerForm");

const ownerName = document.getElementById("ownerName");
const businessName = document.getElementById("businessName");
const category = document.getElementById("category");
const serviceType = document.getElementById("serviceType");

const governorate = document.getElementById("governorate");
const delegation = document.getElementById("delegation");

const phone = document.getElementById("phone");
const address = document.getElementById("address");

const latitude = document.getElementById("latitude");
const longitude = document.getElementById("longitude");

const submitBtn = document.getElementById("submitBtn");
const successMessage = document.getElementById("successMessage");
const errorMessage = document.getElementById("errorMessage");

// =====================================
// 1. LOAD GOVERNORATES
// =====================================

function loadGovernorates() {
    governorate.innerHTML =
        '<option value="">Choisir un gouvernorat</option>';

    Object.keys(regions).forEach(name => {
        const option = document.createElement("option");

        option.value = name;
        option.textContent = name;

        governorate.appendChild(option);
    });
}

// =====================================
// 2. LOAD DELEGATIONS
// =====================================

function loadDelegations() {
    const selectedGovernorate = governorate.value;

    delegation.innerHTML =
        '<option value="">Choisir une délégation</option>';

    const list = regions[selectedGovernorate];

    if (!Array.isArray(list)) return;

    list.forEach(item => {
        const name = typeof item === "string"
            ? item
            : item.name?.fr ||
              item.name?.local ||
              item.name?.en;

        if (!name) return;

        const option = document.createElement("option");

        option.value = name;
        option.textContent = name;

        delegation.appendChild(option);
    });
}

governorate.addEventListener("change", loadDelegations);

// =====================================
// 3. SAVE PROVIDER IN FIREBASE
// =====================================

form.addEventListener("submit", async event => {
    event.preventDefault();

    successMessage.textContent = "";
    errorMessage.textContent = "";

    const latText = latitude.value.trim();
    const lonText = longitude.value.trim();

    // Coordinates must be entered together
    if (Boolean(latText) !== Boolean(lonText)) {
        errorMessage.textContent =
            "Veuillez saisir la latitude et la longitude ensemble.";

        return;
    }

    let lat = null;
    let lon = null;

    if (latText && lonText) {
        lat = Number(latText);
        lon = Number(lonText);

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lon) ||
            lat < -90 || lat > 90 ||
            lon < -180 || lon > 180
        ) {
            errorMessage.textContent =
                "Les coordonnées GPS sont invalides.";

            return;
        }
    }

    const provider = {
        ownerName: ownerName.value.trim(),
        businessName: businessName.value.trim(),
        category: category.value,
        serviceType: serviceType.value.trim(),
        governorate: governorate.value,
        delegation: delegation.value,
        phone: phone.value.trim(),
        address: address.value.trim(),

        lat: lat,
        lon: lon,

        createdAt: serverTimestamp()
    };

    const requiredFields = [
        provider.ownerName,
        provider.businessName,
        provider.category,
        provider.serviceType,
        provider.governorate,
        provider.delegation,
        provider.phone,
        provider.address
    ];

    if (requiredFields.some(value => !value)) {
        errorMessage.textContent =
            "Veuillez remplir tous les champs obligatoires.";

        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Enregistrement...";

    try {
        const docRef = await addDoc(
            collection(db, "providers"),
            provider
        );

        console.log("Provider saved:", docRef.id);

        successMessage.textContent =
            "Votre activité a été ajoutée avec succès !";

        form.reset();

        delegation.innerHTML =
            '<option value="">Choisir une délégation</option>';

        // Reset map marker
        if (providerMarker) {
            map.removeLayer(providerMarker);
            providerMarker = null;
        }

    } catch (error) {
        console.error("Firebase error:", error);

        errorMessage.textContent =
            "Une erreur est survenue. Vérifiez la connexion Firebase.";
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Ajouter mon activité";
    }
});

// =====================================
// 4. INTERACTIVE MAP
// =====================================

const map = L.map("providerMap").setView([34.0, 9.0], 6);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let providerMarker = null;

map.on("click", function(event) {
    const lat = event.latlng.lat;
    const lon = event.latlng.lng;

    latitude.value = lat.toFixed(7);
    longitude.value = lon.toFixed(7);

    if (providerMarker) {
        providerMarker.setLatLng(event.latlng);
    } else {
        providerMarker = L.marker(event.latlng).addTo(map);
    }

    providerMarker
        .bindPopup("Emplacement de votre activité")
        .openPopup();
});

// =====================================
// 5. START
// =====================================

loadGovernorates();

console.log("9RIB provider registration is ready!");

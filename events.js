
import { db, auth } from "./firebase.js";
import { regions } from "./regions.js";

import {
    collection,
    addDoc,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import {
    signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// =====================================
// HTML ELEMENTS
// =====================================

const eventForm = document.getElementById("eventForm");

const eventTitle = document.getElementById("eventTitle");
const eventDescription = document.getElementById("eventDescription");
const eventCategory = document.getElementById("eventCategory");
const eventDate = document.getElementById("eventDate");
const eventTime = document.getElementById("eventTime");
const eventPlace = document.getElementById("eventPlace");

const eventGovernorate = document.getElementById("eventGovernorate");
const eventDelegation = document.getElementById("eventDelegation");

const publishEventButton = document.getElementById("publishEventButton");

const eventSuccess = document.getElementById("eventSuccess");
const eventError = document.getElementById("eventError");

const eventsList = document.getElementById("eventsList");

const filterEventGovernorate =
    document.getElementById("filterEventGovernorate");

const filterEventCategory =
    document.getElementById("filterEventCategory");

let allEvents = [];

// =====================================
// 1. GET TODAY'S DATE
// =====================================

function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

eventDate.min = getTodayDate();

// =====================================
// 2. LOAD GOVERNORATES
// =====================================

function loadGovernorates() {

    Object.keys(regions).forEach(governorate => {

        const option1 = document.createElement("option");
        option1.value = governorate;
        option1.textContent = governorate;
        eventGovernorate.appendChild(option1);

        const option2 = document.createElement("option");
        option2.value = governorate;
        option2.textContent = governorate;
        filterEventGovernorate.appendChild(option2);

    });

}

// =====================================
// 3. LOAD DELEGATIONS
// =====================================

eventGovernorate.addEventListener("change", () => {

    eventDelegation.innerHTML =
        '<option value="">اختار المعتمدية</option>';

    const selectedGovernorate = eventGovernorate.value;

    if (!selectedGovernorate) {
        eventDelegation.disabled = true;
        return;
    }

    const delegations = regions[selectedGovernorate] || [];

    delegations.forEach(delegation => {

        const option = document.createElement("option");
        option.value = delegation;
        option.textContent = delegation;

        eventDelegation.appendChild(option);

    });

    eventDelegation.disabled = false;

});

// =====================================
// 4. CATEGORY LABELS
// =====================================

const categoryLabels = {
    culture: "🎭 ثقافة وفنون",
    sport: "⚽ رياضة",
    education: "📚 تعليم وتكوين",
    charity: "❤️ عمل خيري وتطوّع",
    festival: "🎉 مهرجانات واحتفالات",
    other: "📌 أخرى"
};

// =====================================
// 5. DISPLAY EVENTS
// =====================================

function displayEvents() {

    if (!eventsList) return;

    eventsList.replaceChildren();

    const selectedGovernorate = filterEventGovernorate.value;
    const selectedCategory = filterEventCategory.value;

    const today = getTodayDate();

    const filteredEvents = allEvents.filter(event => {

        const matchesGovernorate =
            !selectedGovernorate ||
            event.governorate === selectedGovernorate;

        const matchesCategory =
            !selectedCategory ||
            event.category === selectedCategory;

        const isUpcoming = event.date >= today;

        return matchesGovernorate &&
               matchesCategory &&
               isUpcoming;

    });

    if (filteredEvents.length === 0) {

        const message = document.createElement("p");
        message.className = "empty-events";
        message.textContent =
            "ما فماش مناسبات قادمة حسب الاختيارات متاعك.";

        eventsList.appendChild(message);
        return;
    }

    filteredEvents.forEach(event => {

        const card = document.createElement("article");
        card.className = "event-card";

        const category = document.createElement("span");
        category.className = "event-category";
        category.textContent =
            categoryLabels[event.category] || "📌 مناسبة";

        const title = document.createElement("h3");
        title.textContent = event.title;

        const description = document.createElement("p");
        description.textContent = event.description;

        const date = document.createElement("p");
        date.className = "event-date";
        date.textContent =
            `📅 ${event.date} — ${event.time}`;

        const place = document.createElement("p");
        place.className = "event-place";
        place.textContent = `📍 ${event.place}`;

        const location = document.createElement("p");
        location.className = "event-location";
        location.textContent =
            `${event.governorate} - ${event.delegation}`;

        card.append(
            category,
            title,
            description,
            date,
            place,
            location
        );

        eventsList.appendChild(card);

    });

}

// =====================================
// 6. FILTER EVENTS
// =====================================

filterEventGovernorate.addEventListener(
    "change",
    displayEvents
);

filterEventCategory.addEventListener(
    "change",
    displayEvents
);

// =====================================
// 7. PUBLISH EVENT
// =====================================

eventForm.addEventListener("submit", async event => {

    event.preventDefault();

    eventSuccess.textContent = "";
    eventError.textContent = "";

    const title = eventTitle.value.trim();
    const description = eventDescription.value.trim();
    const category = eventCategory.value;
    const date = eventDate.value;
    const time = eventTime.value;
    const place = eventPlace.value.trim();

    const governorate = eventGovernorate.value;
    const delegation = eventDelegation.value;

    if (!auth.currentUser) {
        eventError.textContent =
            "يلزم تسجيل الدخول قبل نشر المناسبة.";
        return;
    }

    if (
        !title || !description || !category ||
        !date || !time || !place ||
        !governorate || !delegation
    ) {
        eventError.textContent =
            "عمّر جميع المعلومات المطلوبة.";
        return;
    }

    if (date < getTodayDate()) {
        eventError.textContent =
            "اختار تاريخ اليوم أو تاريخ في المستقبل.";
        return;
    }

    publishEventButton.disabled = true;
    publishEventButton.textContent = "جاري النشر...";

    try {

        await addDoc(collection(db, "events"), {

            title,
            description,
            category,
            date,
            time,
            place,
            governorate,
            delegation,

            authorId: auth.currentUser.uid,
            createdAt: serverTimestamp()

        });

        eventForm.reset();

        eventDelegation.innerHTML =
            '<option value="">اختار المعتمدية</option>';

        eventDelegation.disabled = true;
        eventDate.min = getTodayDate();

        eventSuccess.textContent =
            "تم نشر المناسبة بنجاح ❤️";

    } catch (error) {

        console.error("Publish event error:", error);

        eventError.textContent =
            "صار مشكل في نشر المناسبة. حاول مرة أخرى.";

    } finally {

        publishEventButton.disabled = false;
        publishEventButton.textContent = "نشر المناسبة";

    }

});

// =====================================
// 8. LOAD EVENTS FROM FIRESTORE
// =====================================

function listenToEvents() {

    onSnapshot(
        collection(db, "events"),

        snapshot => {

            allEvents = [];

            snapshot.forEach(documentSnapshot => {

                allEvents.push({
                    id: documentSnapshot.id,
                    ...documentSnapshot.data()
                });

            });

            allEvents.sort((a, b) => {

                const dateA = `${a.date || ""} ${a.time || ""}`;
                const dateB = `${b.date || ""} ${b.time || ""}`;

                return dateA.localeCompare(dateB);

            });

            displayEvents();

        },

        error => {

            console.error("Load events error:", error);

            eventsList.textContent =
                "تعذّر تحميل المناسبات. حاول مرة أخرى.";

        }
    );

}

// =====================================
// 9. INITIALIZE
// =====================================

async function initializeEvents() {

    try {

        loadGovernorates();

        if (!auth.currentUser) {
            await signInAnonymously(auth);
        }

        listenToEvents();

    } catch (error) {

        console.error("Events initialization error:", error);

        eventError.textContent =
            "صار مشكل في الاتصال. حاول مرة أخرى.";

        eventsList.textContent =
            "تعذّر الاتصال بالخدمة.";

    }

}

initializeEvents();

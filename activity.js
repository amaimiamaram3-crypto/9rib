
import { db, auth } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const activityList = document.getElementById("activityList");

onAuthStateChanged(auth, async user => {

    if (!user || user.email !== "amaimiamaram3@gmail.com") {
        window.location.href = "admin.html";
        return;
    }

    loadActivities();
});

async function loadActivities() {

    activityList.innerHTML = "<p>Chargement...</p>";

    try {
        const snapshot = await getDocs(
            collection(db, "activityLogs")
        );

        const activities = snapshot.docs.map(item => ({
            id: item.id,
            ...item.data()
        }));

        activities.sort((a, b) => {
            const dateA = a.createdAt?.toMillis?.() || 0;
            const dateB = b.createdAt?.toMillis?.() || 0;
            return dateB - dateA;
        });

        activityList.innerHTML = "";

        if (activities.length === 0) {
            activityList.innerHTML =
                '<p class="empty-message">Aucune activité pour le moment.</p>';
            return;
        }

        activities.forEach(activity => {

            const item = document.createElement("div");
            item.className = "activity-item";

            const info = document.createElement("div");
            info.className = "activity-info";

            const badge = document.createElement("span");

            const actions = {
                add: "Ajout",
                update: "Modification",
                delete: "Suppression"
            };

            badge.className =
                "activity-badge " + activity.action;

            badge.textContent =
                actions[activity.action] || "Activité";

            const name = document.createElement("h3");
            name.textContent =
                activity.businessName || "Prestataire";

            const description = document.createElement("p");
            description.textContent =
                activity.message || "Opération effectuée";

            const date = document.createElement("span");
            date.className = "activity-date";

            date.textContent = activity.createdAt?.toDate
                ? activity.createdAt.toDate().toLocaleString("fr-FR")
                : "Date inconnue";

            info.append(badge, name, description);
            item.append(info, date);

            activityList.appendChild(item);
        });

    } catch (error) {
    console.error("Erreur historique:", error);

    activityList.innerHTML = "";

    const message = document.createElement("p");
    message.className = "empty-message";
    message.textContent =
        "Erreur : " + error.code + " - " + error.message;

    activityList.appendChild(message);
}
}

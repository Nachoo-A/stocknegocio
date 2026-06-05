import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
collection,
addDoc,
onSnapshot,
deleteDoc,
doc,
updateDoc,
increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
apiKey: "AIzaSyBBlr2u66BtzAOgO-Sdm2xG-jCKXF6N4",
authDomain: "stock2-f70e6.firebaseapp.com",
projectId: "stock2-f70e6",
storageBucket: "stock2-f70e6.firebasestorage.app",
messagingSenderId: "1038144557646",
appId: "1:1038144557646:web:54307b3296b2113b46691f",
measurementId: "G-KN4KLCDC8P"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const tabla = document.getElementById("tabla");
const buscador = document.getElementById("buscador");

let stockData = [];
let alertados = new Set();

// AGREGAR PRODUCTO
document.getElementById("agregar").addEventListener("click", async () => {

    const producto = document.getElementById("producto").value.trim();
    const proveedor = document.getElementById("proveedor").value.trim();
    const cantidad = Number(document.getElementById("cantidad").value);

    if (!producto || cantidad < 0) return;

    await addDoc(collection(db, "stock"), {
        producto,
        proveedor,
        cantidad
    });

    document.getElementById("producto").value = "";
    document.getElementById("proveedor").value = "";
    document.getElementById("cantidad").value = "";
});

// ESCUCHAR FIRESTORE
onSnapshot(collection(db, "stock"), (snapshot) => {

    stockData = [];

    snapshot.forEach((documento) => {
        stockData.push({
            id: documento.id,
            ...documento.data()
        });
    });

    renderTabla();
});

// RENDER + BUSCADOR + ALERTAS
function renderTabla() {

    tabla.innerHTML = "";

    const filtro = buscador.value.toLowerCase();

    stockData.forEach((data) => {

        if (!data.producto.toLowerCase().includes(filtro)) return;

        if (data.cantidad <= 5 && !alertados.has(data.id)) {
            alert(`⚠️ Stock bajo: ${data.producto} (${data.cantidad})`);
            alertados.add(data.id);
        }

        tabla.innerHTML += `
        <tr>
            <td>${data.producto}</td>
            <td>${data.proveedor || "-"}</td>
            <td style="${data.cantidad <= 5 ? 'color:red;font-weight:bold;' : ''}">
                ${data.cantidad <= 5 ? '⚠️ ' : ''}${data.cantidad}
            </td>
            <td><button onclick="sumar('${data.id}')">+</button></td>
            <td><button onclick="restar('${data.id}')">-</button></td>
            <td><button onclick="eliminar('${data.id}')">Eliminar</button></td>
        </tr>
        `;
    });
}

// BUSCADOR
buscador.addEventListener("input", renderTabla);

// FUNCIONES
window.sumar = async(id)=>{
    await updateDoc(doc(db,"stock",id),{
        cantidad: increment(1)
    });

    alertados.delete(id);
}

window.restar = async(id)=>{
    await updateDoc(doc(db,"stock",id),{
        cantidad: increment(-1)
    });
}

window.eliminar = async(id)=>{
    await deleteDoc(doc(db,"stock",id));
    alertados.delete(id);
}
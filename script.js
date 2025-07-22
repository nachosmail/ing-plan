const materiasBase = [
    {
        "cod_materia": "1109",
        "nombre_materia": "Matemáticas I",
        "cod_carrera": "1001",
        "nombre_carrera": "Ingeniería en Sistemas Computacionales",
        "correlativas": [],
        "estado": "Aprobada",
        "nota":""
    },
    {
        "cod_materia": "1110",
        "nombre_materia": "Matemáticas II",
        "cod_carrera": "1001",
        "nombre_carrera": "Ingeniería en Sistemas Computacionales",
        "correlativas": [
            "1109"
        ],
        "estado": "Pendiente",
        "nota":""
    },
    {
        "cod_materia": "1111",
        "nombre_materia": "Programación I",
        "cod_carrera": "1001",
        "nombre_carrera": "Ingeniería en Sistemas Computacionales",
        "correlativas": [],
        "estado": "Aprobada",
        "nota":""
    },
    {
        "cod_materia": "1112",
        "nombre_materia": "Programación II",
        "cod_carrera": "1001",
        "nombre_carrera": "Ingeniería en Sistemas Computacionales",
        "correlativas": [
            "1111"
        ],
        "estado": "Pendiente",
        "nota":""
    },
        {
        "cod_materia": "1109",
        "nombre_materia": "Matemáticas I",
        "cod_carrera": "1000",
        "nombre_carrera": "Ingeniería Industrial",
        "correlativas": [],
        "estado": "Aprobada",
        "nota":""
    },
    {
        "cod_materia": "1110",
        "nombre_materia": "Matemáticas II",
        "cod_carrera": "1000",
        "nombre_carrera": "Ingeniería Industrial",
        "correlativas": [
            "1109"
        ],
        "estado": "Pendiente",
        "nota":""
    },
    {
        "cod_materia": "1111",
        "nombre_materia": "Programación I",
        "cod_carrera": "1000",
        "nombre_carrera": "Ingeniería Industrial",
        "correlativas": [],
        "estado": "Aprobada",
        "nota":""
    },
    {
        "cod_materia": "1112",
        "nombre_materia": "Programación II",
        "cod_carrera": "1000",
        "nombre_carrera": "Ingeniería Industrial",
        "correlativas": [
            "1111"
        ],
        "estado": "Pendiente",
        "nota":""
    }
];

const selectorCarrera = document.getElementById("selector-carrera");
const materiasLista = document.getElementById("materias-lista");
const tituloCarrera = document.getElementById("titulo-carrera");

// Crear contenedor del resumen
const resumenDiv = document.createElement("div");
resumenDiv.id = "resumen";
resumenDiv.className = "resumen-container";
document.querySelector(".container").insertBefore(resumenDiv, materiasLista);

function loadMaterias() {
  const saved = localStorage.getItem("materiasUsuario");
  if (saved) {
    const parsed = JSON.parse(saved);
    return materiasBase.map(m => {
      const match = parsed.find(p => p.cod_materia === m.cod_materia);
      return match ? { ...m, estado: match.estado, nota: match.nota } : m;
    });
  }
  return materiasBase;
}

function saveMaterias(data) {
  const toSave = data.map(({ cod_materia, estado, nota }) => ({ cod_materia, estado, nota }));
  localStorage.setItem("materiasUsuario", JSON.stringify(toSave));
}

let materias = loadMaterias();

const carrerasUnicas = [...new Set(materias.map(m => m.cod_carrera + ' - ' + m.nombre_carrera))];
carrerasUnicas.forEach(carrera => {
  const option = document.createElement("option");
  option.value = carrera.split(" - ")[0];
  option.textContent = carrera;
  selectorCarrera.appendChild(option);
});

selectorCarrera.addEventListener("change", () => {
  renderMaterias(selectorCarrera.value);
});

function renderMaterias(codCarrera) {
  const materiasCarrera = materias.filter(m => m.cod_carrera === codCarrera);
  const estados = {};
  materiasCarrera.forEach(m => estados[m.cod_materia] = m.estado);

  const carreraNombre = materiasCarrera[0]?.nombre_carrera || "Plan de Estudios";
  tituloCarrera.textContent = `${codCarrera} - ${carreraNombre}`;
  materiasLista.innerHTML = "";

  let aprobadas = 0;
  let pendientes = 0;
  let sumaNotas = 0;
  let cantidadNotas = 0;

  materiasCarrera.forEach(materia => {
    const div = document.createElement("div");
    div.classList.add("materia");

    const todasAprobadas = materia.correlativas.every(cod => estados[cod] === "Aprobada");

    if (materia.estado === "Aprobada") {
      div.classList.add("verde");
      aprobadas++;
      if (materia.nota) {
        sumaNotas += parseFloat(materia.nota);
        cantidadNotas++;
      }
    } else if (todasAprobadas) {
      div.classList.add("amarillo");
      pendientes++;
    } else {
      div.classList.add("rojo");
      pendientes++;
    }

    div.textContent = `${materia.cod_materia} - ${materia.nombre_materia} (${materia.estado}${materia.nota ? `, Nota: ${materia.nota}` : ""})`;

    div.addEventListener("click", () => {
      if (materia.estado === "Aprobada") {
        materia.estado = "Pendiente";
        materia.nota = "";
      } else {
        const correlativasAprobadas = materia.correlativas.every(cod => {
          const correl = materias.find(m => m.cod_materia === cod);
          return correl?.estado === "Aprobada";
        });

        if (!correlativasAprobadas) {
          alert("No podés aprobar esta materia hasta que no apruebes las correlativas.");
          return;
        }

        materia.estado = "Aprobada";
        const nota = prompt("Ingrese la nota (opcional):", materia.nota || "");
        if (nota && !isNaN(nota)) materia.nota = nota;
        else materia.nota = "";
      }

      saveMaterias(materias);
      renderMaterias(codCarrera);
    });

    materiasLista.appendChild(div);
  });

  const promedio = cantidadNotas > 0 ? (sumaNotas / cantidadNotas).toFixed(2) : "-";

  resumenDiv.innerHTML = `
    <div class="resumen-card aprobadas">
      <h3>Aprobadas</h3>
      <p>${aprobadas}</p>
    </div>
    <div class="resumen-card pendientes">
      <h3>Pendientes</h3>
      <p>${pendientes}</p>
    </div>
    <div class="resumen-card total">
      <h3>Total</h3>
      <p>${materiasCarrera.length}</p>
    </div>
    <div class="resumen-card promedio">
      <h3>Promedio</h3>
      <p>${promedio}</p>
    </div>
  `;
}

selectorCarrera.selectedIndex = 0;
renderMaterias(selectorCarrera.value);
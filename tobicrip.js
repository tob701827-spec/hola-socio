// Configuración de Supabase
const SUPABASE_URL = "https://TU-PROYECTO.supabase.co";
const SUPABASE_ANON_KEY = "TU-ANON-KEY-AQUI";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Referencias del DOM
const form = document.getElementById('componente-form');
const tablaBody = document.getElementById('tabla-body');
const searchInput = document.getElementById('search-input');
const filterCategoria = document.getElementById('filter-categoria');
const filterEstado = document.getElementById('filter-estado');
const btnCancelar = document.getElementById('btn-cancelar');

let editMode = false;

// Cargar registros al iniciar
document.addEventListener('DOMContentLoaded', obtenerComponentes);

// Event Listeners para Búsqueda y Filtros
searchInput.addEventListener('input', obtenerComponentes);
filterCategoria.addEventListener('change', obtenerComponentes);
filterEstado.addEventListener('change', obtenerComponentes);

// Event Listener para Formulario (Guardar / Modificar)
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('componente-id').value;
  const codigo = document.getElementById('codigo').value.trim();
  const nombre = document.getElementById('nombre').value.trim();
  const categoria = document.getElementById('categoria').value;
  const marca = document.getElementById('marca').value.trim();
  const cantidad = parseInt(document.getElementById('cantidad').value);
  const estado = document.getElementById('estado').value;
  const descripcion = document.getElementById('descripcion').value.trim();

  // Validaciones
  if (!codigo || !nombre || !categoria || !marca || isNaN(cantidad) || cantidad < 0 || !estado) {
    alert("Por favor, complete todos los campos obligatorios correctamente.");
    return;
  }

  const payload = { codigo, nombre, categoria, marca, cantidad, estado, descripcion };

  try {
    if (editMode) {
      // Modificar Registro
      const { error } = await supabase.from('componentes').update(payload).eq('id', id);
      if (error) throw error;
      alert('Registro actualizado con éxito.');
    } else {
      // Alta de Registro
      const { error } = await supabase.from('componentes').insert([payload]);
      if (error) throw error;
      alert('Registro creado con éxito.');
    }
    resetForm();
    obtenerComponentes();
  } catch (error) {
    alert('Error al guardar: ' + error.message);
  }
});

// Función para Consultar y Listar Registros con Filtros
async function obtenerComponentes() {
  try {
    let query = supabase.from('componentes').select('*');

    const search = searchInput.value.trim();
    const cat = filterCategoria.value;
    const est = filterEstado.value;

    if (cat) query = query.eq('categoria', cat);
    if (est) query = query.eq('estado', est);
    if (search) {
      query = query.or(`codigo.ilike.%${search}%,nombre.ilike.%${search}%,marca.ilike.%${search}%`);
    }

    const { data, error } = await query.order('id', { ascending: false });
    if (error) throw error;

    renderTabla(data);
  } catch (error) {
    console.error('Error al obtener datos:', error.message);
  }
}

// Renderizar HTML de la Tabla
function renderTabla(componentes) {
  tablaBody.innerHTML = '';
  if (componentes.length === 0) {
    tablaBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No se encontraron registros.</td></tr>`;
    return;
  }

  componentes.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.codigo}</td>
      <td>${item.nombre}</td>
      <td>${item.categoria}</td>
      <td>${item.marca}</td>
      <td>${item.cantidad}</td>
      <td>${item.estado}</td>
      <td>
        <button class="btn btn-warning" onclick="cargarParaEditar(${item.id})">Editar</button>
        <button class="btn btn-danger" onclick="eliminarComponente(${item.id})">Eliminar</button>
      </td>
    `;
    tablaBody.appendChild(tr);
  });
}

// Función para Cargar Datos en el Formulario para Editar
async function cargarParaEditar(id) {
  const { data, error } = await supabase.from('componentes').select('*').eq('id', id).single();
  if (error) {
    alert('Error al obtener registro: ' + error.message);
    return;
  }

  document.getElementById('componente-id').value = data.id;
  document.getElementById('codigo').value = data.codigo;
  document.getElementById('nombre').value = data.nombre;
  document.getElementById('categoria').value = data.categoria;
  document.getElementById('marca').value = data.marca;
  document.getElementById('cantidad').value = data.cantidad;
  document.getElementById('estado').value = data.estado;
  document.getElementById('descripcion').value = data.descripcion || '';

  document.getElementById('form-title').innerText = 'Modificar Componente';
  document.getElementById('btn-guardar').innerText = 'Actualizar';
  btnCancelar.style.display = 'inline-block';
  editMode = true;
}

// Función para Eliminar Registro
async function eliminarComponente(id) {
  const confirmacion = confirm("¿Está seguro de que desea eliminar este registro definitivamente?");
  if (!confirmacion) return;

  try {
    const { error } = await supabase.from('componentes').delete().eq('id', id);
    if (error) throw error;
    alert("Registro eliminado correctamente.");
    obtenerComponentes();
  } catch (error) {
    alert("Error al eliminar: " + error.message);
  }
}

// Resetear Formulario
btnCancelar.addEventListener('click', resetForm);

function resetForm() {
  form.reset();
  document.getElementById('componente-id').value = '';
  document.getElementById('form-title').innerText = 'Registrar Componente';
  document.getElementById('btn-guardar').innerText = 'Guardar';
  btnCancelar.style.display = 'none';
  editMode = false;
}
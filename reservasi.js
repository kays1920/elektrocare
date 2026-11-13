'use strict';

const REGION_API = 'https://www.emsifa.com/api-wilayah-indonesia/v2';
const form = document.getElementById('reservationForm');
const province = document.getElementById('province');
const regency = document.getElementById('regency');
const district = document.getElementById('district');
const village = document.getElementById('village');
const postalCode = document.getElementById('postalCode');
const regionStatus = document.getElementById('regionStatus');
const retryRegions = document.getElementById('retryRegions');
const device = document.getElementById('device');
const otherDeviceField = document.getElementById('otherDeviceField');
const otherDevice = document.getElementById('otherDevice');
const formMessage = document.getElementById('formMessage');
const dateInput = document.getElementById('visitDate');

function localDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
dateInput.min = localDateString();

device.addEventListener('change', () => {
  const needsOther = device.value === 'other';
  otherDeviceField.classList.toggle('hidden', !needsOther);
  otherDevice.required = needsOther;
  if (!needsOther) otherDevice.value = '';
});

function setOptions(select, rows, placeholder) {
  select.replaceChildren(new Option(placeholder, ''));
  rows.forEach((row) => {
    const option = new Option(row.name, row.id);
    if (select === village) option.dataset.postalCode = row.postal_code || '';
    select.add(option);
  });
  select.disabled = rows.length === 0;
}
function resetRegionSelects() {
  setOptions(regency, [], 'Pilih provinsi dahulu');
  setOptions(district, [], 'Pilih kabupaten/kota dahulu');
  setOptions(village, [], 'Pilih kecamatan dahulu');
  postalCode.value = '';
}
async function getRegions(path) {
  const response = await fetch(`${REGION_API}/${path}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Server wilayah merespons ${response.status}`);
  const result = await response.json();
  // API v2 wraps payloads in { data, meta }.
  const rows = result.data;
  if (!Array.isArray(rows)) throw new Error('Format data wilayah tidak sesuai');
  return rows;
}
function showRegionError(error) {
  regionStatus.textContent = 'Data wilayah gagal dimuat. Periksa koneksi internet, lalu coba muat ulang. Anda dapat mencoba lagi tanpa mengisi ulang data lainnya.';
  regionStatus.classList.add('is-error');
  retryRegions.classList.remove('hidden');
  province.disabled = true;
  resetRegionSelects();
  console.error('Gagal memuat data wilayah Indonesia:', error);
}
async function loadProvinces() {
  regionStatus.classList.remove('is-error');
  regionStatus.textContent = 'Memuat data wilayah Indonesia…';
  retryRegions.classList.add('hidden');
  province.disabled = true;
  try {
    const rows = await getRegions('provinces.json');
    setOptions(province, rows, 'Pilih provinsi');
    province.disabled = false;
    regionStatus.textContent = `Data wilayah siap (${rows.length} provinsi). Pilih secara berurutan.`;
  } catch (error) { showRegionError(error); }
}

province.addEventListener('change', async () => {
  resetRegionSelects();
  if (!province.value) return;
  regency.disabled = true;
  regency.replaceChildren(new Option('Memuat kabupaten/kota…', ''));
  try { setOptions(regency, await getRegions(`regencies/${encodeURIComponent(province.value)}.json`), 'Pilih kabupaten/kota'); }
  catch (error) { showRegionError(error); }
});
regency.addEventListener('change', async () => {
  setOptions(district, [], 'Memuat kecamatan…');
  setOptions(village, [], 'Pilih kecamatan dahulu');
  postalCode.value = '';
  if (!regency.value) { district.options[0].textContent = 'Pilih kabupaten/kota dahulu'; return; }
  try { setOptions(district, await getRegions(`districts/${encodeURIComponent(regency.value)}.json`), 'Pilih kecamatan'); }
  catch (error) { showRegionError(error); }
});
district.addEventListener('change', async () => {
  setOptions(village, [], 'Memuat kelurahan/desa…');
  postalCode.value = '';
  if (!district.value) { village.options[0].textContent = 'Pilih kecamatan dahulu'; return; }
  try { setOptions(village, await getRegions(`villages/${encodeURIComponent(district.value)}.json`), 'Pilih kelurahan/desa'); }
  catch (error) { showRegionError(error); }
});
village.addEventListener('change', () => {
  postalCode.value = village.selectedOptions[0]?.dataset.postalCode || '';
});
retryRegions.addEventListener('click', loadProvinces);

function clearFieldError(field) {
  field.closest('.field')?.classList.remove('has-error');
  const error = field.closest('.field')?.querySelector('.error-text');
  if (error) error.textContent = '';
}
function markFieldError(field, message) {
  field.closest('.field')?.classList.add('has-error');
  const error = field.closest('.field')?.querySelector('.error-text');
  if (error) error.textContent = message;
}
form.querySelectorAll('input, select, textarea').forEach((field) => {
  field.addEventListener('input', () => clearFieldError(field));
  field.addEventListener('change', () => clearFieldError(field));
});
function getValue(id) { return document.getElementById(id).value.trim(); }
function selectedLabel(id) {
  const select = document.getElementById(id);
  return select.selectedOptions[0]?.textContent.trim() || '';
}
function validatePhone(field) {
  const raw = field.value.trim();
  const digits = raw.replace(/\D/g, '');
  if (!/^[+\d() .-]+$/.test(raw) || digits.length < 9 || digits.length > 15) return null;
  return raw;
}
form.addEventListener('submit', (event) => {
  event.preventDefault();
  formMessage.textContent = '';
  let firstInvalid = null;
  form.querySelectorAll('input, select, textarea').forEach(clearFieldError);

  for (const field of form.querySelectorAll('input, select, textarea')) {
    if (field.required && !field.value.trim()) {
      markFieldError(field, 'Kolom ini wajib diisi.');
      firstInvalid ||= field;
    } else if (field.value.trim() && !field.checkValidity()) {
      const message = field === dateInput ? 'Pilih tanggal hari ini atau setelahnya.' :
        field.type === 'email' ? 'Masukkan alamat email dengan format yang benar.' :
        field === postalCode ? 'Kode pos harus terdiri dari 5 angka.' : 'Periksa kembali isian ini.';
      markFieldError(field, message);
      firstInvalid ||= field;
    }
  }
  const phoneField = document.getElementById('phone');
  const validPhone = validatePhone(phoneField);
  if (phoneField.value.trim() && !validPhone) {
    markFieldError(phoneField, 'Masukkan nomor WhatsApp yang valid (9–15 digit).');
    firstInvalid ||= phoneField;
  }
  if (!dateInput.value || dateInput.value < localDateString()) {
    markFieldError(dateInput, 'Tanggal kunjungan tidak boleh sudah berlalu.');
    firstInvalid ||= dateInput;
  }
  if (firstInvalid) {
    formMessage.textContent = 'Mohon lengkapi atau perbaiki kolom yang ditandai.';
    firstInvalid.focus();
    return;
  }

  const lines = [
    'RESERVASI LAYANAN ELEKTROCARE', '', 'DATA PELANGGAN',
    `Nama: ${getValue('fullName')}`,
    `No. WhatsApp: ${getValue('phone')}`,
    `Email: ${getValue('email') || '-'}`,
    '', 'PERANGKAT',
    `Jenis perangkat: ${device.value === 'other' ? getValue('otherDevice') : device.value}`,
    `Merek: ${getValue('brand') || '-'}`,
    `Model: ${getValue('model') || '-'}`,
    '', 'KELUHAN',
    `Jenis kerusakan: ${getValue('damageType') || '-'}`,
    `Deskripsi kerusakan: ${getValue('description')}`,
    '', 'ALAMAT KUNJUNGAN',
    `Provinsi: ${selectedLabel('province')}`,
    `Kabupaten/Kota: ${selectedLabel('regency')}`,
    `Kecamatan: ${selectedLabel('district')}`,
    `Kelurahan/Desa: ${selectedLabel('village')}`,
    `Kode Pos: ${getValue('postalCode') || '-'}`,
    `Alamat lengkap: ${getValue('address')}`,
    '', 'JADWAL',
    `Tanggal: ${dateInput.value}`,
    `Jam: ${document.getElementById('visitTime').value}`,
    '', 'Mohon konfirmasi ketersediaan teknisi dan jadwal kunjungan.'
  ];
  const url = `https://wa.me/6282249803113?text=${encodeURIComponent(lines.join('\n'))}`;
  window.location.assign(url);
});

loadProvinces();

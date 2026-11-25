/**
 * SIMWARGA - Main Application Logic
 * Interactive controllers, UI renders, Chart.js integrations, and modal managers.
 */

// Global App State
window.AppState = {
  currentTab: 'dashboard',
  wargaSubTab: 'semua', // 'semua' | 'kk'
  kasSubTab: 'buku', // 'buku' | 'verifikasi' | 'stiker'
  selectedBuktiId: null,
  editingWargaId: null,
  editingRondaId: null,
  selectedSuratForPrint: null,
  charts: {
    demografi: null,
    keuangan: null
  }
};

// Formatting utilities
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(number);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', options);
  } catch (e) {
    return dateStr;
  }
};

const getAge = (birthDateString) => {
  if (!birthDateString) return 0;
  const today = new Date();
  const birthDate = new Date(birthDateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Toast notification helper
function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;

  const toast = document.createElement('div');
  const bgClass = type === 'success' ? 'bg-emerald-600 text-white' : type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-white';
  
  toast.className = `flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl transition-all duration-300 transform translate-y-2 opacity-0 text-sm font-medium ${bgClass}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Navigation Tab Switcher
function switchTab(tabId) {
  AppState.currentTab = tabId;

  // Update nav item active styles
  document.querySelectorAll('.nav-item').forEach(btn => {
    const isTarget = btn.getAttribute('data-tab') === tabId;
    if (isTarget) {
      btn.classList.add('bg-blue-600', 'text-white', 'shadow-md', 'shadow-blue-500/20');
      btn.classList.remove('text-slate-600', 'hover:bg-slate-100');
    } else {
      btn.classList.remove('bg-blue-600', 'text-white', 'shadow-md', 'shadow-blue-500/20');
      btn.classList.add('text-slate-600', 'hover:bg-slate-100');
    }
  });

  // Show corresponding view section
  document.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.add('hidden');
  });

  const targetView = document.getElementById(`view-${tabId}`);
  if (targetView) {
    targetView.classList.remove('hidden');
  }

  // Refresh view content
  if (tabId === 'dashboard') renderDashboard();
  else if (tabId === 'warga') renderWarga();
  else if (tabId === 'keuangan') setKasSubTab(AppState.kasSubTab || 'buku');
  else if (tabId === 'surat') renderSurat();
  else if (tabId === 'tamu') renderTamu();
  else if (tabId === 'keamanan') renderKeamanan();
  else if (tabId === 'settings') renderSettings();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- DASHBOARD MODULE ---
function renderDashboard() {
  const settings = SimStore.getSettings();
  const wargaList = SimStore.getWarga();
  const transaksiList = SimStore.getTransaksi();
  const tamuList = SimStore.getTamu();
  const suratList = SimStore.getSurat();

  // Update Header title
  document.getElementById('header-rt-title').textContent = `${settings.namaRt} / ${settings.namaRw} Kelurahan ${settings.kelurahan}`;
  document.getElementById('header-ketua-name').textContent = `Ketua RT: ${settings.namaKetuaRt}`;

  // Unique KK count
  const kkSet = new Set(wargaList.map(w => w.noKk).filter(Boolean));

  // Finance summary
  let totalMasuk = 0;
  let totalKeluar = 0;
  transaksiList.forEach(trx => {
    if (trx.tipe === 'Pemasukan') totalMasuk += Number(trx.nominal);
    if (trx.tipe === 'Pengeluaran') totalKeluar += Number(trx.nominal);
  });
  const totalSaldo = (Number(settings.saldoAwal) || 0) + totalMasuk - totalKeluar;

  // Active tamu
  const tamuAktif = tamuList.filter(t => t.status === 'Aktif').length;

  // Pending Bukti Bayar count
  const pendingCount = SimStore.getBuktiBayar().filter(b => b.statusVerifikasi === 'Menunggu Verifikasi').length;
  const badgeBukti = document.getElementById('badge-pending-bukti');
  if (badgeBukti) badgeBukti.textContent = pendingCount;

  // Demographic stats
  let totalLaki = 0;
  let totalPerempuan = 0;
  let anakCount = 0; // < 17
  let produktifCount = 0; // 17 - 59
  let lansiaCount = 0; // >= 60

  wargaList.forEach(w => {
    if (w.jenisKelamin === 'Laki-laki') totalLaki++;
    else totalPerempuan++;

    const age = getAge(w.tanggalLahir);
    if (age < 17) anakCount++;
    else if (age >= 60) lansiaCount++;
    else produktifCount++;
  });

  // Set counter cards
  document.getElementById('dash-total-warga').textContent = wargaList.length;
  document.getElementById('dash-total-kk').textContent = kkSet.size;
  document.getElementById('dash-saldo-kas').textContent = formatRupiah(totalSaldo);
  document.getElementById('dash-tamu-aktif').textContent = tamuAktif;

  document.getElementById('dash-stat-laki').textContent = totalLaki;
  document.getElementById('dash-stat-perempuan').textContent = totalPerempuan;
  document.getElementById('dash-stat-anak').textContent = anakCount;
  document.getElementById('dash-stat-produktif').textContent = produktifCount;
  document.getElementById('dash-stat-lansia').textContent = lansiaCount;

  // Recent Surats
  const recentSuratEl = document.getElementById('dash-recent-surat');
  if (recentSuratEl) {
    if (suratList.length === 0) {
      recentSuratEl.innerHTML = `<p class="text-sm text-slate-400 py-4 text-center">Belum ada pengajuan surat.</p>`;
    } else {
      recentSuratEl.innerHTML = suratList.slice(0, 4).map(s => `
        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
          <div class="space-y-0.5">
            <p class="text-sm font-semibold text-slate-800">${s.nama}</p>
            <p class="text-xs text-slate-500 line-clamp-1">${s.keperluan}</p>
          </div>
          <span class="px-2.5 py-1 text-xs font-medium rounded-full ${s.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}">${s.status}</span>
        </div>
      `).join('');
    }
  }

  // Recent Kas
  const recentKasEl = document.getElementById('dash-recent-kas');
  if (recentKasEl) {
    if (transaksiList.length === 0) {
      recentKasEl.innerHTML = `<p class="text-sm text-slate-400 py-4 text-center">Belum ada transaksi kas.</p>`;
    } else {
      recentKasEl.innerHTML = transaksiList.slice(0, 4).map(t => `
        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
          <div class="space-y-0.5">
            <p class="text-sm font-medium text-slate-800">${t.keterangan}</p>
            <p class="text-xs text-slate-400">${formatDate(t.tanggal)} • ${t.kategori}</p>
          </div>
          <span class="text-sm font-bold ${t.tipe === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-600'}">
            ${t.tipe === 'Pemasukan' ? '+' : '-'}${formatRupiah(t.nominal)}
          </span>
        </div>
      `).join('');
    }
  }

  // Charts
  renderCharts(totalLaki, totalPerempuan, anakCount, produktifCount, lansiaCount, totalMasuk, totalKeluar);
}

function renderCharts(laki, perempuan, anak, produktif, lansia, masuk, keluar) {
  // Chart 1: Demografi
  const ctxDemo = document.getElementById('chart-demografi')?.getContext('2d');
  if (ctxDemo) {
    if (AppState.charts.demografi) AppState.charts.demografi.destroy();
    AppState.charts.demografi = new Chart(ctxDemo, {
      type: 'doughnut',
      data: {
        labels: ['Laki-laki', 'Perempuan', 'Anak (<17)', 'Usia Produktif', 'Lansia (60+)'],
        datasets: [{
          data: [laki, perempuan, anak, produktif, lansia],
          backgroundColor: ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, font: { size: 11, family: "'Plus Jakarta Sans'" } }
          }
        },
        cutout: '65%'
      }
    });
  }

  // Chart 2: Keuangan Bar Chart
  const ctxKeuangan = document.getElementById('chart-keuangan')?.getContext('2d');
  if (ctxKeuangan) {
    if (AppState.charts.keuangan) AppState.charts.keuangan.destroy();
    AppState.charts.keuangan = new Chart(ctxKeuangan, {
      type: 'bar',
      data: {
        labels: ['Total Pemasukan', 'Total Pengeluaran'],
        datasets: [{
          label: 'Nominal (Rp)',
          data: [masuk, keluar],
          backgroundColor: ['#10b981', '#f43f5e'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (val) => 'Rp ' + (val / 1000).toLocaleString('id-ID') + 'k'
            }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

// --- DATA WARGA & KARTU KELUARGA MODULE ---
function renderWarga() {
  const wargaList = SimStore.getWarga();
  const search = document.getElementById('search-warga')?.value.toLowerCase() || '';
  const filterKelamin = document.getElementById('filter-kelamin')?.value || '';
  const filterHubungan = document.getElementById('filter-hubungan')?.value || '';

  const filtered = wargaList.filter(w => {
    const matchSearch = w.nama.toLowerCase().includes(search) ||
                        w.nik.toLowerCase().includes(search) ||
                        (w.noKk && w.noKk.toLowerCase().includes(search)) ||
                        (w.pekerjaan && w.pekerjaan.toLowerCase().includes(search)) ||
                        (w.alamat && w.alamat.toLowerCase().includes(search));
    const matchKelamin = !filterKelamin || w.jenisKelamin === filterKelamin;
    const matchHubungan = !filterHubungan || w.statusKeluarga === filterHubungan;
    return matchSearch && matchKelamin && matchHubungan;
  });

  const tableBody = document.getElementById('table-warga-body');
  const kkContainer = document.getElementById('container-kartu-keluarga');

  if (AppState.wargaSubTab === 'semua') {
    document.getElementById('warga-table-wrapper').classList.remove('hidden');
    kkContainer.classList.add('hidden');

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400">Tidak ada data warga yang cocok.</td></tr>`;
      return;
    }

    tableBody.innerHTML = filtered.map((w, idx) => `
      <tr class="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
        <td class="py-3 px-4 text-xs font-medium text-slate-400">${idx + 1}</td>
        <td class="py-3 px-4">
          <div class="font-semibold text-slate-800 text-sm">${w.nama}</div>
          <div class="text-xs text-slate-500 flex items-center gap-2">
            <span>NIK: ${w.nik}</span>
            <span class="inline-block w-1 h-1 rounded-full bg-slate-300"></span>
            <span>KK: ${w.noKk || '-'}</span>
          </div>
        </td>
        <td class="py-3 px-4">
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${w.jenisKelamin === 'Laki-laki' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-pink-50 text-pink-700 border border-pink-200'}">
            ${w.jenisKelamin}
          </span>
          <div class="text-xs text-slate-400 mt-0.5">${getAge(w.tanggalLahir)} th (${formatDate(w.tanggalLahir)})</div>
        </td>
        <td class="py-3 px-4 text-sm text-slate-700">
          <span class="font-medium text-slate-800">${w.statusKeluarga || '-'}</span>
          <div class="text-xs text-slate-500">${w.pekerjaan || '-'}</div>
        </td>
        <td class="py-3 px-4 text-xs text-slate-600">
          <div>${w.alamat || '-'}</div>
          <div class="text-slate-400">HP: ${w.noHp || '-'}</div>
        </td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded-md text-xs font-medium ${w.statusTinggal === 'Tetap' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
            ${w.statusTinggal || 'Tetap'}
          </span>
        </td>
        <td class="py-3 px-4 text-right">
          <div class="inline-flex items-center gap-1.5">
            <button onclick="viewDetailWarga('${w.id}')" class="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50" title="Detail">
              <i data-lucide="eye" class="w-4 h-4"></i>
            </button>
            <button onclick="editWarga('${w.id}')" class="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50" title="Edit">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button onclick="confirmDeleteWarga('${w.id}', '${w.nama}')" class="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50" title="Hapus">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } else {
    // Mode Grouping Kartu Keluarga
    document.getElementById('warga-table-wrapper').classList.add('hidden');
    kkContainer.classList.remove('hidden');

    // Group by KK
    const kkGroups = {};
    wargaList.forEach(w => {
      const kk = w.noKk || 'Tanpa No KK';
      if (!kkGroups[kk]) kkGroups[kk] = [];
      kkGroups[kk].push(w);
    });

    kkContainer.innerHTML = Object.keys(kkGroups).map(kkNum => {
      const members = kkGroups[kkNum];
      const kepala = members.find(m => m.statusKeluarga === 'Kepala Keluarga') || members[0];
      return `
        <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">Kartu Keluarga</span>
                <span class="font-bold text-slate-800 text-base">${kkNum}</span>
              </div>
              <p class="text-xs text-slate-500 mt-1">Kepala Keluarga: <strong class="text-slate-800">${kepala?.nama || '-'}</strong> | Alamat: ${kepala?.alamat || '-'}</p>
            </div>
            <span class="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">${members.length} Anggota</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="text-slate-400 border-b border-slate-100 pb-1">
                  <th class="py-2 px-2 font-medium">Nama Anggota</th>
                  <th class="py-2 px-2 font-medium">NIK</th>
                  <th class="py-2 px-2 font-medium">Status Hubungan</th>
                  <th class="py-2 px-2 font-medium">L/P</th>
                  <th class="py-2 px-2 font-medium">Usia</th>
                  <th class="py-2 px-2 font-medium">Pekerjaan</th>
                  <th class="py-2 px-2 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                ${members.map(m => `
                  <tr>
                    <td class="py-2 px-2 font-semibold text-slate-800">${m.nama}</td>
                    <td class="py-2 px-2 text-slate-500">${m.nik}</td>
                    <td class="py-2 px-2"><span class="px-2 py-0.5 rounded font-medium ${m.statusKeluarga === 'Kepala Keluarga' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'}">${m.statusKeluarga || '-'}</span></td>
                    <td class="py-2 px-2">${m.jenisKelamin}</td>
                    <td class="py-2 px-2">${getAge(m.tanggalLahir)} th</td>
                    <td class="py-2 px-2 text-slate-600">${m.pekerjaan || '-'}</td>
                    <td class="py-2 px-2 text-right">
                      <button onclick="viewDetailWarga('${m.id}')" class="text-blue-600 hover:underline">Detail</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }).join('');
  }

  // Refresh icons
  if (window.lucide) lucide.createIcons();
}

function setWargaSubTab(subTab) {
  AppState.wargaSubTab = subTab;
  const btnSemua = document.getElementById('subtab-warga-semua');
  const btnKk = document.getElementById('subtab-warga-kk');

  if (subTab === 'semua') {
    btnSemua.classList.add('bg-white', 'text-blue-600', 'shadow-sm');
    btnSemua.classList.remove('text-slate-600');
    btnKk.classList.remove('bg-white', 'text-blue-600', 'shadow-sm');
    btnKk.classList.add('text-slate-600');
  } else {
    btnKk.classList.add('bg-white', 'text-blue-600', 'shadow-sm');
    btnKk.classList.remove('text-slate-600');
    btnSemua.classList.remove('bg-white', 'text-blue-600', 'shadow-sm');
    btnSemua.classList.add('text-slate-600');
  }
  renderWarga();
}

// Modal Warga Form
function openModalWarga(id = null) {
  AppState.editingWargaId = id;
  const modal = document.getElementById('modal-warga');
  const title = document.getElementById('modal-warga-title');
  const form = document.getElementById('form-warga');

  form.reset();

  if (id) {
    title.textContent = 'Edit Data Warga';
    const warga = SimStore.getWarga().find(w => w.id === id);
    if (warga) {
      document.getElementById('input-warga-nik').value = warga.nik || '';
      document.getElementById('input-warga-kk').value = warga.noKk || '';
      document.getElementById('input-warga-nama').value = warga.nama || '';
      document.getElementById('input-warga-kelamin').value = warga.jenisKelamin || 'Laki-laki';
      document.getElementById('input-warga-tempat-lahir').value = warga.tempatLahir || '';
      document.getElementById('input-warga-tgl-lahir').value = warga.tanggalLahir || '';
      document.getElementById('input-warga-agama').value = warga.agama || 'Islam';
      document.getElementById('input-warga-pendidikan').value = warga.pendidikan || 'SMA/SMK';
      document.getElementById('input-warga-pekerjaan').value = warga.pekerjaan || '';
      document.getElementById('input-warga-perkawinan').value = warga.statusPerkawinan || 'Belum Kawin';
      document.getElementById('input-warga-hubungan').value = warga.statusKeluarga || 'Kepala Keluarga';
      document.getElementById('input-warga-tinggal').value = warga.statusTinggal || 'Tetap';
      document.getElementById('input-warga-alamat').value = warga.alamat || '';
      document.getElementById('input-warga-hp').value = warga.noHp || '';
      document.getElementById('input-warga-goldarah').value = warga.golDarah || 'O';
      document.getElementById('input-warga-disabilitas').value = warga.disabilitas || 'Tidak';
    }
  } else {
    title.textContent = 'Tambah Data Warga Baru';
  }

  modal.classList.remove('hidden');
}

function closeModalWarga() {
  document.getElementById('modal-warga').classList.add('hidden');
  AppState.editingWargaId = null;
}

function handleSaveWarga(event) {
  event.preventDefault();
  const nik = document.getElementById('input-warga-nik').value.trim();
  const noKk = document.getElementById('input-warga-kk').value.trim();
  const nama = document.getElementById('input-warga-nama').value.trim();

  if (!nik || !nama) {
    showToast('NIK dan Nama Warga wajib diisi!', 'error');
    return;
  }

  const wargaData = {
    nik,
    noKk,
    nama,
    jenisKelamin: document.getElementById('input-warga-kelamin').value,
    tempatLahir: document.getElementById('input-warga-tempat-lahir').value.trim(),
    tanggalLahir: document.getElementById('input-warga-tgl-lahir').value,
    agama: document.getElementById('input-warga-agama').value,
    pendidikan: document.getElementById('input-warga-pendidikan').value,
    pekerjaan: document.getElementById('input-warga-pekerjaan').value.trim(),
    statusPerkawinan: document.getElementById('input-warga-perkawinan').value,
    statusKeluarga: document.getElementById('input-warga-hubungan').value,
    statusTinggal: document.getElementById('input-warga-tinggal').value,
    alamat: document.getElementById('input-warga-alamat').value.trim(),
    noHp: document.getElementById('input-warga-hp').value.trim(),
    golDarah: document.getElementById('input-warga-goldarah').value,
    disabilitas: document.getElementById('input-warga-disabilitas').value
  };

  if (AppState.editingWargaId) {
    SimStore.updateWarga(AppState.editingWargaId, wargaData);
    showToast('Data warga berhasil diperbarui');
  } else {
    SimStore.addWarga(wargaData);
    showToast('Data warga baru berhasil ditambahkan');
  }

  closeModalWarga();
  renderWarga();
  renderDashboard();
}

function editWarga(id) {
  openModalWarga(id);
}

function confirmDeleteWarga(id, nama) {
  if (confirm(`Apakah Anda yakin ingin menghapus data warga: "${nama}"?`)) {
    SimStore.deleteWarga(id);
    showToast('Data warga berhasil dihapus');
    renderWarga();
    renderDashboard();
  }
}

function viewDetailWarga(id) {
  const wargaList = SimStore.getWarga();
  const warga = wargaList.find(w => w.id === id);
  if (!warga) return;

  const modal = document.getElementById('modal-detail-warga');
  const content = document.getElementById('detail-warga-content');

  // Anggota KK yang sama
  const familyMembers = warga.noKk ? wargaList.filter(w => w.noKk === warga.noKk) : [warga];

  content.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div class="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
          ${warga.nama.charAt(0)}
        </div>
        <div>
          <h4 class="text-lg font-bold text-slate-800">${warga.nama}</h4>
          <p class="text-xs text-slate-500">NIK: <span class="font-mono font-medium">${warga.nik}</span> | No. KK: <span class="font-mono font-medium">${warga.noKk || '-'}</span></p>
          <span class="mt-1 inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${warga.jenisKelamin === 'Laki-laki' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}">${warga.jenisKelamin}</span>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div class="p-3 bg-white rounded-xl border border-slate-100">
          <p class="text-slate-400">Tempat, Tgl Lahir</p>
          <p class="font-semibold text-slate-700">${warga.tempatLahir || '-'}, ${formatDate(warga.tanggalLahir)}</p>
        </div>
        <div class="p-3 bg-white rounded-xl border border-slate-100">
          <p class="text-slate-400">Usia</p>
          <p class="font-semibold text-slate-700">${getAge(warga.tanggalLahir)} Tahun</p>
        </div>
        <div class="p-3 bg-white rounded-xl border border-slate-100">
          <p class="text-slate-400">Agama</p>
          <p class="font-semibold text-slate-700">${warga.agama || '-'}</p>
        </div>
        <div class="p-3 bg-white rounded-xl border border-slate-100">
          <p class="text-slate-400">Hubungan Keluarga</p>
          <p class="font-semibold text-slate-700">${warga.statusKeluarga || '-'}</p>
        </div>
        <div class="p-3 bg-white rounded-xl border border-slate-100">
          <p class="text-slate-400">Status Perkawinan</p>
          <p class="font-semibold text-slate-700">${warga.statusPerkawinan || '-'}</p>
        </div>
        <div class="p-3 bg-white rounded-xl border border-slate-100">
          <p class="text-slate-400">Pendidikan Terakhir</p>
          <p class="font-semibold text-slate-700">${warga.pendidikan || '-'}</p>
        </div>
        <div class="p-3 bg-white rounded-xl border border-slate-100">
          <p class="text-slate-400">Pekerjaan</p>
          <p class="font-semibold text-slate-700">${warga.pekerjaan || '-'}</p>
        </div>
        <div class="p-3 bg-white rounded-xl border border-slate-100">
          <p class="text-slate-400">Golongan Darah</p>
          <p class="font-semibold text-slate-700">${warga.golDarah || '-'}</p>
        </div>
        <div class="p-3 bg-white rounded-xl border border-slate-100">
          <p class="text-slate-400">No. WhatsApp / HP</p>
          <p class="font-semibold text-slate-700">${warga.noHp || '-'}</p>
        </div>
        <div class="col-span-2 sm:col-span-3 p-3 bg-white rounded-xl border border-slate-100">
          <p class="text-slate-400">Alamat Lengkap</p>
          <p class="font-semibold text-slate-700">${warga.alamat || '-'}</p>
        </div>
      </div>

      <div class="border-t border-slate-100 pt-4">
        <h5 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Anggota Keluarga (Satu No. KK)</h5>
        <div class="space-y-1.5">
          ${familyMembers.map(m => `
            <div class="flex items-center justify-between p-2 rounded-lg ${m.id === warga.id ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50'} text-xs">
              <span class="font-medium text-slate-800">${m.nama} (${m.statusKeluarga})</span>
              <span class="text-slate-500">${m.jenisKelamin} • ${getAge(m.tanggalLahir)} th</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}

function closeModalDetailWarga() {
  document.getElementById('modal-detail-warga').classList.add('hidden');
}

// --- KAS, IURAN & VERIFIKASI QR RT MODULE ---
function setKasSubTab(subTab) {
  AppState.kasSubTab = subTab;
  
  const btnBuku = document.getElementById('subtab-kas-buku');
  const btnVerif = document.getElementById('subtab-kas-verifikasi');
  const btnStiker = document.getElementById('subtab-kas-stiker');
  const btnLaporan = document.getElementById('subtab-kas-laporan');

  const panelBuku = document.getElementById('panel-kas-buku');
  const panelVerif = document.getElementById('panel-kas-verifikasi');
  const panelStiker = document.getElementById('panel-kas-stiker');
  const panelLaporan = document.getElementById('panel-kas-laporan');

  [btnBuku, btnVerif, btnStiker, btnLaporan].forEach(b => {
    if (b) {
      b.classList.remove('bg-white', 'text-blue-600', 'font-bold', 'shadow-xs');
      b.classList.add('text-slate-600');
    }
  });

  if (panelBuku) panelBuku.classList.add('hidden');
  if (panelVerif) panelVerif.classList.add('hidden');
  if (panelStiker) panelStiker.classList.add('hidden');
  if (panelLaporan) panelLaporan.classList.add('hidden');

  if (subTab === 'buku') {
    btnBuku?.classList.add('bg-white', 'text-blue-600', 'font-bold', 'shadow-xs');
    btnBuku?.classList.remove('text-slate-600');
    panelBuku?.classList.remove('hidden');
    renderKeuangan();
  } else if (subTab === 'verifikasi') {
    btnVerif?.classList.add('bg-white', 'text-blue-600', 'font-bold', 'shadow-xs');
    btnVerif?.classList.remove('text-slate-600');
    panelVerif?.classList.remove('hidden');
    renderBuktiBayarTable();
  } else if (subTab === 'stiker') {
    btnStiker?.classList.add('bg-white', 'text-blue-600', 'font-bold', 'shadow-xs');
    btnStiker?.classList.remove('text-slate-600');
    panelStiker?.classList.remove('hidden');
    renderStikerGrid();
  } else if (subTab === 'laporan') {
    btnLaporan?.classList.add('bg-white', 'text-blue-600', 'font-bold', 'shadow-xs');
    btnLaporan?.classList.remove('text-slate-600');
    panelLaporan?.classList.remove('hidden');
    renderLaporanBlok();
  }

  if (window.lucide) lucide.createIcons();
}

function renderKeuangan() {
  const transaksiList = SimStore.getTransaksi();
  const settings = SimStore.getSettings();
  const filterTipe = document.getElementById('filter-kas-tipe')?.value || 'Semua';

  // Update Pending Bukti Count Badge
  const pendingCount = SimStore.getBuktiBayar().filter(b => b.statusVerifikasi === 'Menunggu Verifikasi').length;
  const badgeEl = document.getElementById('badge-pending-bukti');
  if (badgeEl) badgeEl.textContent = pendingCount;

  let totalMasuk = 0;
  let totalKeluar = 0;
  let saldoBank = Number(settings.saldoAwalBank) || (Number(settings.saldoAwal) ? Math.round(Number(settings.saldoAwal) * 0.8) : 2000000);
  let saldoTunai = Number(settings.saldoAwalTunai) || (Number(settings.saldoAwal) ? Math.round(Number(settings.saldoAwal) * 0.2) : 500000);

  transaksiList.forEach(t => {
    const nom = Number(t.nominal) || 0;
    const isTunai = (t.metodeBayar || '').toLowerCase().includes('tunai');
    if (t.tipe === 'Pemasukan') {
      totalMasuk += nom;
      if (isTunai) saldoTunai += nom;
      else saldoBank += nom;
    }
    if (t.tipe === 'Pengeluaran') {
      totalKeluar += nom;
      if (isTunai) saldoTunai -= nom;
      else saldoBank -= nom;
    }
  });
  const totalSaldo = saldoBank + saldoTunai;

  document.getElementById('kas-total-saldo').textContent = formatRupiah(totalSaldo);
  document.getElementById('kas-total-masuk').textContent = formatRupiah(totalMasuk);
  document.getElementById('kas-total-keluar').textContent = formatRupiah(totalKeluar);

  const elBank = document.getElementById('kas-kantong-bank');
  if (elBank) elBank.textContent = formatRupiah(saldoBank);
  const elTunai = document.getElementById('kas-kantong-tunai');
  if (elTunai) elTunai.textContent = formatRupiah(saldoTunai);

  const filtered = transaksiList.filter(t => {
    if (filterTipe === 'Semua') return true;
    return t.tipe === filterTipe;
  });

  const tableBody = document.getElementById('table-kas-body');
  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" class="py-8 text-center text-slate-400">Belum ada riwayat transaksi.</td></tr>`;
    return;
  }

  tableBody.innerHTML = filtered.map((t, idx) => {
    const isTunai = (t.metodeBayar || '').toLowerCase().includes('tunai');
    const isQris = (t.metodeBayar || '').toUpperCase().includes('QRIS');
    const badgeKanal = isTunai
      ? '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800" title="Akun 1-101 (Kas di Tangan)">Tunai</span>'
      : isQris
      ? '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800" title="Akun 1-103 (Kas QRIS)">QRIS</span>'
      : '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800" title="Akun 1-102 (Kas di Bank BCA)">Bank BCA</span>';

    return `
    <tr class="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
      <td class="py-3 px-4 text-xs font-medium text-slate-400">${idx + 1}</td>
      <td class="py-3 px-4 text-xs font-medium text-slate-600">${formatDate(t.tanggal)}</td>
      <td class="py-3 px-4">
        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${t.tipe === 'Pemasukan' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
          ${t.tipe}
        </span>
      </td>
      <td class="py-3 px-4">${badgeKanal}</td>
      <td class="py-3 px-4 text-xs font-medium text-slate-700">${t.kategori}</td>
      <td class="py-3 px-4">
        <div class="text-sm font-semibold text-slate-800">${t.keterangan}</div>
        <div class="text-xs text-slate-400">Pihak: ${t.pembayar || '-'}</div>
      </td>
      <td class="py-3 px-4 text-sm font-bold ${t.tipe === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-600'}">
        ${t.tipe === 'Pemasukan' ? '+' : '-'}${formatRupiah(t.nominal)}
      </td>
      <td class="py-3 px-4 text-right">
        <button onclick="deleteTransaksi('${t.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50" title="Hapus">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </td>
    </tr>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

// Render Bukti Bayar Table (Panel 2)
function renderBuktiBayarTable() {
  const list = SimStore.getBuktiBayar();
  const filterStatus = document.getElementById('filter-bukti-status')?.value || 'Semua';
  const filtered = list.filter(b => filterStatus === 'Semua' ? true : b.statusVerifikasi === filterStatus);
  const tbody = document.getElementById('table-bukti-bayar-body');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400">Tidak ada data bukti transfer sesuai filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((b, idx) => `
    <tr class="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
      <td class="py-3 px-4 text-xs font-medium text-slate-400">${idx + 1}</td>
      <td class="py-3 px-4">
        <div onclick="openModalVerifikasiBukti('${b.id}')" class="w-12 h-12 rounded-xl bg-slate-900 border border-slate-200 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center shadow-xs">
          <img src="${b.imageUrl}" alt="Struk" class="w-full h-full object-cover">
        </div>
      </td>
      <td class="py-3 px-4">
        <div class="font-bold text-slate-800 text-sm">${b.blok} No. ${b.nomorRumah}</div>
        <div class="text-xs text-slate-500">${b.nama}</div>
      </td>
      <td class="py-3 px-4">
        <span class="font-bold text-slate-800">${formatRupiah(b.nominal)}</span>
        <div class="text-xs text-slate-400">Periode: ${b.periodeBulan}</div>
      </td>
      <td class="py-3 px-4 text-xs">
        <div class="font-mono text-slate-700 font-semibold">${b.nomorReferensi || '-'}</div>
        <div class="text-slate-400">${formatDate(b.tanggalBayar || b.uploadedAt)}</div>
      </td>
      <td class="py-3 px-4">
        <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${b.statusVerifikasi === 'Terverifikasi' ? 'bg-emerald-100 text-emerald-800' : b.statusVerifikasi === 'Ditolak' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}">
          ${b.statusVerifikasi}
        </span>
      </td>
      <td class="py-3 px-4 text-right">
        <div class="inline-flex items-center gap-1.5">
          <button onclick="openModalVerifikasiBukti('${b.id}')" class="px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs flex items-center gap-1" title="Tinjau Detail">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
            <span>Tinjau</span>
          </button>
          ${b.statusVerifikasi === 'Menunggu Verifikasi' ? `
            <button onclick="quickApproveBukti('${b.id}')" class="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-semibold" title="Setujui Langsung">
              <i data-lucide="check" class="w-4 h-4"></i>
            </button>
          ` : b.statusVerifikasi === 'Terverifikasi' ? `
            <button onclick="rollbackBuktiBayar('${b.id}')" class="px-2 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold text-xs flex items-center gap-1" title="Batalkan Verifikasi & Tarik Kas">
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
              <span>Batal</span>
            </button>
          ` : ''}
          <button onclick="deleteBuktiBayar('${b.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50" title="Hapus">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

// Sinkronisasi Manual Bukti Transfer
async function syncBuktiBayarManual() {
  const syncText = document.getElementById('sync-status-text');
  if (syncText) {
    syncText.textContent = 'Menyinkronkan...';
  }

  if (SimStore.isHostedMode() && SimStore.getCloudConfig().enabled) {
    const res = await SimStore.syncRemote();
    if (res.success) {
      showToast(`Sinkronisasi Cloud Berhasil! (${res.mergeCount || 0} data baru ditarik)`);
    } else {
      showToast(res.reason || res.error || 'Sinkronisasi lokal selesai', 'info');
    }
  } else {
    showToast('Data bukti transfer warga diperbarui dari penyimpanan lokal!');
  }

  const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  if (syncText) {
    syncText.textContent = `Tersinkron: ${timeNow}`;
  }
  renderBuktiBayarTable();
  renderKeuangan();
  renderDashboard();
  renderLaporanBlok();
}

// Modal Verifikasi Bukti
function openModalVerifikasiBukti(id) {
  AppState.selectedBuktiId = id;
  const bukti = SimStore.getBuktiBayar().find(b => b.id === id);
  if (!bukti) return;

  const settings = SimStore.getSettings();
  const tarifWajib = Number(settings.tarifIuranBulanan) || 50000;

  // Analisis Multi-Bulan
  const monthCodes = (bukti.periodeBulan || '').split(',').map(s => s.trim()).filter(Boolean);
  const countMonths = Math.max(1, monthCodes.length);
  const totalEstimasiWajib = countMonths * tarifWajib;

  document.getElementById('verif-preview-img').src = bukti.imageUrl;
  document.getElementById('verif-blok-rumah').textContent = `${bukti.blok} No. ${bukti.nomorRumah}`;
  document.getElementById('verif-nama-penghuni').textContent = bukti.nama;
  document.getElementById('verif-periode').textContent = `${bukti.periodeBulan} (${countMonths} Bulan)`;
  document.getElementById('verif-nominal').textContent = formatRupiah(bukti.nominal);
  document.getElementById('verif-tanggal').textContent = formatDate(bukti.tanggalBayar || bukti.uploadedAt);
  document.getElementById('verif-ref').textContent = bukti.nomorReferensi || '-';
  document.getElementById('verif-catatan').textContent = bukti.catatan || '-';
  document.getElementById('verif-hash').textContent = bukti.imageHash || '-';

  const badge = document.getElementById('verif-status-badge');
  badge.textContent = bukti.statusVerifikasi;
  badge.className = `px-2.5 py-1 rounded-full text-xs font-bold ${bukti.statusVerifikasi === 'Terverifikasi' ? 'bg-emerald-100 text-emerald-800' : bukti.statusVerifikasi === 'Ditolak' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`;

  // Smart OCR & Rule Engine Validation Analysis
  const ocrBox = document.getElementById('verif-ocr-box');
  const ocrBadge = document.getElementById('verif-ocr-badge');
  const ocrDesc = document.getElementById('verif-ocr-desc');

  if (ocrBox && ocrBadge && ocrDesc) {
    if (Number(bukti.nominal) >= totalEstimasiWajib) {
      ocrBox.className = 'p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1.5';
      ocrBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-200 text-emerald-900';
      ocrBadge.textContent = 'LULUS OTOMATIS';
      ocrDesc.className = 'text-[11px] text-emerald-700 leading-snug';
      ocrDesc.innerHTML = `Status transaksi sah &bull; Nominal cocok (${formatRupiah(bukti.nominal)} untuk ${countMonths} bulan) &bull; Rekening tujuan terverifikasi Kas RT &bull; Ref Bank unik.`;
    } else {
      ocrBox.className = 'p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-1.5';
      ocrBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 text-amber-900';
      ocrBadge.textContent = 'PERLU CEK MANUAL';
      ocrDesc.className = 'text-[11px] text-amber-700 leading-snug';
      ocrDesc.innerHTML = `Peringatan: Nominal yang dibayarkan (${formatRupiah(bukti.nominal)}) kurang dari tarif standar (${formatRupiah(totalEstimasiWajib)} untuk ${countMonths} bulan).`;
    }
  }

  // Label Tombol Respon WhatsApp
  const btnWa = document.getElementById('btn-modal-wa-warga');
  const labelWa = document.getElementById('label-modal-wa-warga');
  if (btnWa && labelWa) {
    if (bukti.statusVerifikasi === 'Terverifikasi') {
      labelWa.textContent = 'Kirim Kuitansi & Tanda Terima Sah via WhatsApp';
      btnWa.className = 'w-full py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors';
    } else if (bukti.statusVerifikasi === 'Ditolak') {
      labelWa.textContent = 'Kirim Penjelasan Penolakan ke WhatsApp Warga';
      btnWa.className = 'w-full py-2 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors';
    } else {
      labelWa.textContent = 'Kirim Konfirmasi / Catatan ke WhatsApp Warga';
      btnWa.className = 'w-full py-2 px-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors';
    }
  }

  document.getElementById('modal-verifikasi-bukti').classList.remove('hidden');
}

function closeModalVerifikasiBukti() {
  document.getElementById('modal-verifikasi-bukti').classList.add('hidden');
  AppState.selectedBuktiId = null;
}

// Setujui Bukti & Catat ke Buku Kas Otomatis
function approveBuktiBayar(id = null) {
  const targetId = id || AppState.selectedBuktiId;
  const bukti = SimStore.getBuktiBayar().find(b => b.id === targetId);
  if (!bukti) return;

  // Otomatis Bukukan ke Buku Kas Masuk
  const isTunai = (bukti.metodeBayar || '').toLowerCase().includes('tunai');
  const isQris = (bukti.metodeBayar || '').toUpperCase().includes('QRIS');
  const kanal = isTunai ? 'Kas Tunai' : isQris ? 'QRIS' : 'Kas di Bank (BCA)';
  const kodeDebit = isTunai ? '1-101' : isQris ? '1-103' : '1-102';

  const newTrx = SimStore.addTransaksi({
    tanggal: bukti.tanggalBayar || new Date().toISOString().split('T')[0],
    tipe: 'Pemasukan',
    kategori: 'Iuran Bulanan',
    metodeBayar: kanal,
    kodeAkunDebit: kodeDebit,
    kodeAkunKredit: '4-101',
    nominal: Number(bukti.nominal),
    keterangan: `Iuran ${bukti.periodeBulan} - ${bukti.blok} No. ${bukti.nomorRumah} (${bukti.nama})`,
    pembayar: `${bukti.nama} (${bukti.blok} No. ${bukti.nomorRumah})`
  });

  // Update Status Bukti & Tautkan transaksiId untuk rollback
  SimStore.updateBuktiBayar(targetId, {
    statusVerifikasi: 'Terverifikasi',
    transaksiId: newTrx.id
  });

  showToast(`Bukti iuran ${bukti.nama} berhasil diverifikasi & dicatat ke Kas!`);
  closeModalVerifikasiBukti();
  renderBuktiBayarTable();
  renderKeuangan();
  renderDashboard();
  renderLaporanBlok();
}

function quickApproveBukti(id) {
  approveBuktiBayar(id);
}

// Pembatalan (Rollback) Verifikasi Bukti
function rollbackBuktiBayar(id) {
  const bukti = SimStore.getBuktiBayar().find(b => b.id === id);
  if (!bukti) return;

  if (!confirm(`Batalkan verifikasi untuk ${bukti.nama} (${bukti.blok} No. ${bukti.nomorRumah})? Mutasi kas sebesar ${formatRupiah(bukti.nominal)} akan ditarik kembali.`)) {
    return;
  }

  // Hapus transaksi kas terkait jika ada
  if (bukti.transaksiId) {
    SimStore.deleteTransaksi(bukti.transaksiId);
  }

  // Kembalikan status ke Menunggu Verifikasi
  SimStore.updateBuktiBayar(id, {
    statusVerifikasi: 'Menunggu Verifikasi',
    transaksiId: null
  });

  showToast(`Verifikasi ${bukti.nama} dibatalkan. Saldo kas telah dikoreksi kembali.`);
  renderBuktiBayarTable();
  renderKeuangan();
  renderDashboard();
  renderLaporanBlok();
}

// Persetujuan Massal (Batch Approve) untuk Bukti yang Lulus Otomatis
function batchApproveBukti() {
  const settings = SimStore.getSettings();
  const tarifWajib = Number(settings.tarifIuranBulanan) || 50000;
  const pendingList = SimStore.getBuktiBayar().filter(b => b.statusVerifikasi === 'Menunggu Verifikasi');

  if (pendingList.length === 0) {
    showToast('Tidak ada bukti transfer yang menunggu verifikasi.', 'info');
    return;
  }

  // Filter yang memenuhi syarat lulus otomatis
  const passList = pendingList.filter(b => {
    const count = (b.periodeBulan || '').split(',').length || 1;
    return Number(b.nominal) >= (count * tarifWajib);
  });

  if (passList.length === 0) {
    showToast('Tidak ada bukti transfer yang memenuhi syarat Lulus Otomatis.', 'info');
    return;
  }

  if (!confirm(`Setujui sekaligus ${passList.length} bukti transfer yang LULUS OTOMATIS dan catat ke buku kas?`)) {
    return;
  }

  passList.forEach(bukti => {
    const isTunai = (bukti.metodeBayar || '').toLowerCase().includes('tunai');
    const isQris = (bukti.metodeBayar || '').toUpperCase().includes('QRIS');
    const kanal = isTunai ? 'Kas Tunai' : isQris ? 'QRIS' : 'Kas di Bank (BCA)';
    const kodeDebit = isTunai ? '1-101' : isQris ? '1-103' : '1-102';

    const newTrx = SimStore.addTransaksi({
      tanggal: bukti.tanggalBayar || new Date().toISOString().split('T')[0],
      tipe: 'Pemasukan',
      kategori: 'Iuran Bulanan',
      metodeBayar: kanal,
      kodeAkunDebit: kodeDebit,
      kodeAkunKredit: '4-101',
      nominal: Number(bukti.nominal),
      keterangan: `Iuran ${bukti.periodeBulan} - ${bukti.blok} No. ${bukti.nomorRumah} (${bukti.nama})`,
      pembayar: `${bukti.nama} (${bukti.blok} No. ${bukti.nomorRumah})`
    });

    SimStore.updateBuktiBayar(bukti.id, {
      statusVerifikasi: 'Terverifikasi',
      transaksiId: newTrx.id
    });
  });

  showToast(`Berhasil menyetujui ${passList.length} bukti transfer secara massal!`);
  renderBuktiBayarTable();
  renderKeuangan();
  renderDashboard();
  renderLaporanBlok();
}

// Kirim Pesan Respon Balik WhatsApp ke Warga
function kirimPesanWaWarga() {
  const targetId = AppState.selectedBuktiId;
  const bukti = SimStore.getBuktiBayar().find(b => b.id === targetId);
  if (!bukti) return;

  const unit = SimStore.getUnitRumah().find(u => u.id === bukti.unitId || (u.blok === bukti.blok && u.nomorRumah === bukti.nomorRumah));
  const noHp = unit?.noHp ? unit.noHp.replace(/[^0-9]/g, '') : '';
  const settings = SimStore.getSettings();

  let message = '';
  if (bukti.statusVerifikasi === 'Terverifikasi') {
    message = `*TANDA TERIMA RESMI IURAN WARGA*\n` +
      `${settings.namaRt} / ${settings.namaRw} ${settings.kelurahan}\n\n` +
      `Kepada Yth: Bpk/Ibu ${bukti.nama} (${bukti.blok} No. ${bukti.nomorRumah})\n` +
      `Status: *LUNAS & TERVERIFIKASI*\n` +
      `Periode: ${bukti.periodeBulan}\n` +
      `Nominal: ${formatRupiah(bukti.nominal)}\n` +
      `Tanggal Verifikasi: ${formatDate(new Date().toISOString().split('T')[0])}\n` +
      `Ref Bank: ${bukti.nomorReferensi || '-'}\n\n` +
      `Terima kasih atas partisipasi dan kepedulian Anda dalam menjaga kerukunan & pembangunan lingkungan.`;
  } else if (bukti.statusVerifikasi === 'Ditolak') {
    message = `*PEMBERITAHUAN VERIFIKASI IURAN WARGA*\n` +
      `${settings.namaRt} / ${settings.namaRw} ${settings.kelurahan}\n\n` +
      `Kepada Yth: Bpk/Ibu ${bukti.nama} (${bukti.blok} No. ${bukti.nomorRumah})\n` +
      `Status: *BELUM DAPAT DIVERIFIKASI / DITOLAK*\n` +
      `Keterangan: ${bukti.catatan || 'Nominal tidak sesuai / bukti transfer tidak valid'}\n\n` +
      `Mohon lakukan konfirmasi ulang atau unggah bukti transfer yang sah melalui portal SIMWARGA. Terima kasih.`;
  } else {
    message = `Halo Bpk/Ibu ${bukti.nama} (${bukti.blok} No. ${bukti.nomorRumah}), bukti transfer iuran periode ${bukti.periodeBulan} sebesar ${formatRupiah(bukti.nominal)} saat ini sedang kami proses. Terima kasih.`;
  }

  const encoded = encodeURIComponent(message);
  const waUrl = noHp ? `https://wa.me/${noHp}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  window.open(waUrl, '_blank');
}

// Tolak Bukti Bayar
function rejectBuktiBayarPrompt(id = null) {
  const targetId = id || AppState.selectedBuktiId;
  const bukti = SimStore.getBuktiBayar().find(b => b.id === targetId);
  if (!bukti) return;

  const alasan = prompt('Alasan penolakan bukti pembayaran:', 'Nominal transfer tidak sesuai / Gambar bukan bukti transfer yang sah');
  if (alasan === null) return;

  SimStore.updateBuktiBayar(targetId, {
    statusVerifikasi: 'Ditolak',
    catatan: `DITOLAK: ${alasan}`
  });

  showToast('Bukti pembayaran ditandai Ditolak', 'error');
  closeModalVerifikasiBukti();
  renderBuktiBayarTable();
  renderLaporanBlok();
}

function deleteBuktiBayar(id) {
  if (confirm('Hapus arsip bukti transfer ini?')) {
    SimStore.deleteBuktiBayar(id);
    showToast('Bukti transfer dihapus');
    renderBuktiBayarTable();
    renderKeuangan();
  }
}

// Generator Lembar Stiker QR Code (Panel 3)
function renderStikerGrid() {
  const filterBlok = document.getElementById('filter-stiker-blok')?.value || 'Semua';
  const unitList = SimStore.getUnitRumah().filter(u => filterBlok === 'Semua' ? true : u.blok === filterBlok);
  const container = document.getElementById('stiker-preview-grid');
  const settings = SimStore.getSettings();

  if (!container) return;

  container.innerHTML = unitList.map(u => {
    const qrid = `qrcode-${u.id}`;
    const payUrl = `bayar.html?unit=${encodeURIComponent(u.id)}`;

    return `
      <div class="bg-white border-2 border-slate-300 rounded-3xl p-5 shadow-xs flex flex-col items-center text-center space-y-3 relative overflow-hidden">
        <div class="w-full border-b border-slate-100 pb-2 flex items-center justify-between text-left">
          <div>
            <span class="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">${settings.namaRt} / ${settings.namaRw}</span>
            <span class="text-[11px] font-extrabold text-slate-800">Kel. ${settings.kelurahan}</span>
          </div>
          <span class="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-mono text-slate-600 font-bold">${u.id}</span>
        </div>

        <!-- Wadah QR Code -->
        <div id="${qrid}" class="p-2 bg-white rounded-2xl shadow-inner border border-slate-200"></div>

        <div>
          <h3 class="text-xl font-black text-slate-900 tracking-tight">${u.blok} No. ${u.nomorRumah}</h3>
          <p class="text-xs font-semibold text-slate-600">${u.namaPenghuni}</p>
          <p class="text-[10px] text-slate-400 mt-0.5">${u.alamat || '-'}</p>
        </div>

        <div class="w-full pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Tarif Iuran: <strong class="text-slate-800">${formatRupiah(u.iuranWajib || 50000)}</strong></span>
          <a href="${payUrl}" target="_blank" class="text-blue-600 hover:underline font-bold flex items-center gap-1">
            <span>Tes Link</span>
            <i data-lucide="arrow-up-right" class="w-3 h-3"></i>
          </a>
        </div>
      </div>
    `;
  }).join('');

  // Generate QR Code instances
  setTimeout(() => {
    unitList.forEach(u => {
      const el = document.getElementById(`qrcode-${u.id}`);
      if (el && window.QRCode) {
        el.innerHTML = '';
        const fullUrl = `${window.location.href.split('index.html')[0]}bayar.html?unit=${encodeURIComponent(u.id)}`;
        new QRCode(el, {
          text: fullUrl,
          width: 110,
          height: 110,
          colorDark: '#0f172a',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });
      }
    });
    if (window.lucide) lucide.createIcons();
  }, 50);
}

// Print Stiker A4
function triggerPrintStiker() {
  const filterBlok = document.getElementById('filter-stiker-blok')?.value || 'Semua';
  const unitList = SimStore.getUnitRumah().filter(u => filterBlok === 'Semua' ? true : u.blok === filterBlok);
  const settings = SimStore.getSettings();
  const printContainer = document.getElementById('printable-stiker');

  printContainer.innerHTML = `
    <div class="mb-4 text-center border-b pb-2">
      <h2 class="text-sm font-bold uppercase tracking-wider">LEMBAR STIKER QR CODE IURAN WARGA</h2>
      <p class="text-xs text-slate-600">${settings.namaRt} / ${settings.namaRw} Kelurahan ${settings.kelurahan}</p>
    </div>
    <div class="grid grid-cols-2 gap-4">
      ${unitList.map(u => `
        <div class="border-2 border-dashed border-black p-4 rounded-xl flex items-center gap-4 text-left break-inside-avoid">
          <div id="print-qr-${u.id}" class="w-24 h-24 shrink-0 flex items-center justify-center border border-slate-300 p-1"></div>
          <div class="space-y-1">
            <span class="text-[9px] font-bold uppercase block">${settings.namaRt}/${settings.namaRw} &bull; ${settings.kelurahan}</span>
            <h3 class="text-base font-black">${u.blok} No. ${u.nomorRumah}</h3>
            <p class="text-xs font-semibold text-slate-800">${u.namaPenghuni}</p>
            <p class="text-[9px] text-slate-600 leading-tight">Scan QR ini dengan kamera HP untuk konfirmasi bayar iuran bulanan.</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Render QR Codes into print container
  unitList.forEach(u => {
    const el = document.getElementById(`print-qr-${u.id}`);
    if (el && window.QRCode) {
      const fullUrl = `${window.location.href.split('index.html')[0]}bayar.html?unit=${encodeURIComponent(u.id)}`;
      new QRCode(el, {
        text: fullUrl,
        width: 84,
        height: 84,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    }
  });

  document.getElementById('modal-preview-stiker').classList.remove('hidden');
  document.body.className = 'printing-stiker';
}

function closePreviewStiker() {
  document.getElementById('modal-preview-stiker').classList.add('hidden');
  document.body.className = '';
}

// --- LAPORAN REKAPITULASI IURAN PER BLOK MODULE ---
function renderLaporanBlok() {
  const tahun = document.getElementById('filter-laporan-tahun')?.value || '2026';
  const filterBlok = document.getElementById('filter-laporan-blok')?.value || 'Semua';
  const allUnits = SimStore.getUnitRumah();
  const filteredUnits = allUnits.filter(u => filterBlok === 'Semua' ? true : u.blok === filterBlok);
  const buktiList = SimStore.getBuktiBayar().filter(b => b.statusVerifikasi === 'Terverifikasi');
  const kasList = SimStore.getTransaksi().filter(t => t.tipe === 'Pemasukan');
  const settings = SimStore.getSettings();
  const tarif = Number(settings.tarifIuranBulanan) || 50000;

  const currentMonthNum = '10'; // Default penagihan bulan Oktober
  let totalLunasBulanIni = 0;

  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const tbody = document.getElementById('table-laporan-blok-body');
  if (!tbody) return;

  tbody.innerHTML = filteredUnits.map((u, idx) => {
    let totalUangUnit = 0;
    let lunasBulanIni = false;

    const monthCells = months.map(m => {
      const periodKey = `${tahun}-${m}`;
      // Cek apakah ada bukti bayar terverifikasi (mendukung multi-bulan)
      const hasBukti = buktiList.find(b => (b.unitId === u.id || (b.blok === u.blok && b.nomorRumah === u.nomorRumah)) && (b.periodeBulan || '').split(',').map(s => s.trim()).includes(periodKey));
      
      // Cek juga dari mutasi kas jika nama cocok
      const hasKas = kasList.find(k => k.pembayar && k.pembayar.includes(u.namaPenghuni) && k.keterangan.includes(m));

      const isPaid = !!hasBukti || !!hasKas;
      if (isPaid) {
        totalUangUnit += tarif;
        if (m === currentMonthNum) lunasBulanIni = true;
        return `<td class="py-2.5 px-1"><span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold" title="Lunas ${periodKey}">✓</span></td>`;
      } else {
        return `<td class="py-2.5 px-1"><span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-300 text-[10px]" title="Belum Bayar ${periodKey}">-</span></td>`;
      }
    }).join('');

    if (lunasBulanIni) totalLunasBulanIni++;

    return `
      <tr class="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
        <td class="py-2.5 px-3 text-left font-medium text-slate-400">${idx + 1}</td>
        <td class="py-2.5 px-3 text-left font-bold text-slate-800">${u.blok} No. ${u.nomorRumah}</td>
        <td class="py-2.5 px-3 text-left text-slate-600 font-medium">${u.namaPenghuni}</td>
        ${monthCells}
        <td class="py-2.5 px-3 text-right font-bold ${totalUangUnit > 0 ? 'text-emerald-600' : 'text-slate-400'}">${formatRupiah(totalUangUnit)}</td>
      </tr>
    `;
  }).join('');

  // Update Statistik Header
  const totalRumah = filteredUnits.length;
  const belumBayar = Math.max(0, totalRumah - totalLunasBulanIni);
  const persentase = totalRumah > 0 ? Math.round((totalLunasBulanIni / totalRumah) * 100) : 0;

  document.getElementById('lap-total-rumah').textContent = totalRumah;
  document.getElementById('lap-rumah-lunas').textContent = totalLunasBulanIni;
  document.getElementById('lap-rumah-tunggak').textContent = belumBayar;
  document.getElementById('lap-persen-kepatuhan').textContent = `${persentase}%`;
}

// Export Laporan Rekapitulasi CSV
function exportLaporanCSV() {
  const tahun = document.getElementById('filter-laporan-tahun')?.value || '2026';
  const filterBlok = document.getElementById('filter-laporan-blok')?.value || 'Semua';
  const allUnits = SimStore.getUnitRumah().filter(u => filterBlok === 'Semua' ? true : u.blok === filterBlok);
  const buktiList = SimStore.getBuktiBayar().filter(b => b.statusVerifikasi === 'Terverifikasi');

  const headers = ['No', 'Blok', 'No Rumah', 'Nama Penghuni', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des', 'Total Bayar'];
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  const rows = allUnits.map((u, idx) => {
    let total = 0;
    const mCols = months.map(m => {
      const p = `${tahun}-${m}`;
      const has = buktiList.find(b => (b.unitId === u.id || (b.blok === u.blok && b.nomorRumah === u.nomorRumah)) && (b.periodeBulan || '').split(',').map(s => s.trim()).includes(p));
      if (has) {
        total += tarif;
        return '"LUNAS"';
      }
      return '"-"';
    });

    return [
      idx + 1,
      `"${u.blok}"`,
      `"${u.nomorRumah}"`,
      `"${u.namaPenghuni}"`,
      ...mCols,
      `"${total}"`
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `rekap_iuran_${filterBlok.toLowerCase().replace(' ', '_')}_${tahun}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Laporan rekapitulasi iuran berhasil diunduh (CSV)!');
}

// Cetak Laporan Rekapitulasi (A4 Landscape)
function triggerPrintLaporan() {
  const tahun = document.getElementById('filter-laporan-tahun')?.value || '2026';
  const filterBlok = document.getElementById('filter-laporan-blok')?.value || 'Semua';
  const units = SimStore.getUnitRumah().filter(u => filterBlok === 'Semua' ? true : u.blok === filterBlok);
  const buktiList = SimStore.getBuktiBayar().filter(b => b.statusVerifikasi === 'Terverifikasi');
  const settings = SimStore.getSettings();
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  const printArea = document.getElementById('printable-laporan-iuran');

  printArea.innerHTML = `
    <div class="font-sans text-xs">
      <!-- Kop Dokumen -->
      <div class="text-center border-b-2 border-black pb-3 mb-4">
        <h3 class="text-xs uppercase font-bold tracking-widest">RUKUN TETANGGA ${settings.namaRt} / RUKUN WARGA ${settings.namaRw}</h3>
        <h2 class="text-base font-extrabold uppercase">KELURAHAN ${settings.kelurahan}</h2>
        <p class="text-[11px] text-slate-600">Kecamatan ${settings.kecamatan}, ${settings.kota}</p>
      </div>

      <div class="text-center mb-4">
        <h2 class="text-sm font-bold uppercase underline">LAPORAN REKAPITULASI IURAN WARGA TAHUN ${tahun}</h2>
        <p class="text-[11px] text-slate-500">Filter Wilayah: <strong>${filterBlok}</strong> &bull; Dicetak pada: ${formatDate(new Date().toISOString().split('T')[0])}</p>
      </div>

      <!-- Tabel Matriks Cetak -->
      <table class="w-full border-collapse border border-black text-[10px] text-center mb-6">
        <thead>
          <tr class="bg-slate-100">
            <th class="border border-black p-1 text-left w-6">No</th>
            <th class="border border-black p-1 text-left">Blok / No.</th>
            <th class="border border-black p-1 text-left">Nama Penghuni</th>
            <th class="border border-black p-1">Jan</th>
            <th class="border border-black p-1">Feb</th>
            <th class="border border-black p-1">Mar</th>
            <th class="border border-black p-1">Apr</th>
            <th class="border border-black p-1">Mei</th>
            <th class="border border-black p-1">Jun</th>
            <th class="border border-black p-1">Jul</th>
            <th class="border border-black p-1">Agu</th>
            <th class="border border-black p-1">Sep</th>
            <th class="border border-black p-1">Okt</th>
            <th class="border border-black p-1">Nov</th>
            <th class="border border-black p-1">Des</th>
            <th class="border border-black p-1 text-right">Total Kas</th>
          </tr>
        </thead>
        <tbody>
          ${units.map((u, idx) => {
            let total = 0;
            const cells = months.map(m => {
              const p = `${tahun}-${m}`;
              const has = buktiList.find(b => (b.unitId === u.id || (b.blok === u.blok && b.nomorRumah === u.nomorRumah)) && (b.periodeBulan || '').split(',').map(s => s.trim()).includes(p));
              if (has) {
                total += Number(settings.tarifIuranBulanan || 50000);
                return `<td class="border border-black p-1 font-bold text-emerald-800">L</td>`;
              }
              return `<td class="border border-black p-1 text-slate-300">-</td>`;
            }).join('');

            return `
              <tr>
                <td class="border border-black p-1 text-left">${idx + 1}</td>
                <td class="border border-black p-1 text-left font-bold">${u.blok} No. ${u.nomorRumah}</td>
                <td class="border border-black p-1 text-left">${u.namaPenghuni}</td>
                ${cells}
                <td class="border border-black p-1 text-right font-bold">${formatRupiah(total)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <p class="text-[10px] text-slate-500 mb-8">* Keterangan: [L] = Lunas Terverifikasi, [-] = Belum Membayar / Menunggak.</p>

      <!-- Kolom Tanda Tangan -->
      <div class="flex justify-between items-start text-center font-sans mt-6">
        <div>
          <p class="text-[11px] mb-14">Mengetahui,<br><strong>Ketua RT ${settings.namaRt}</strong></p>
          <p class="font-bold underline text-xs">(${settings.namaKetuaRt})</p>
        </div>
        <div>
          <p class="text-[11px] mb-14">${settings.kota}, ${formatDate(new Date().toISOString().split('T')[0])}<br><strong>Bendahara Kas RT</strong></p>
          <p class="font-bold underline text-xs">( Bendahara RT ${settings.namaRt} )</p>
        </div>
      </div>
    </div>
  `;

  document.getElementById('modal-preview-laporan').classList.remove('hidden');
  document.body.className = 'printing-laporan';
}

function closePreviewLaporan() {
  document.getElementById('modal-preview-laporan').classList.add('hidden');
  document.body.className = '';
}

function triggerPrintSurat() {
  document.body.className = 'printing-surat';
  window.print();
  setTimeout(() => { document.body.className = ''; }, 1000);
}

function openModalKas() {
  document.getElementById('form-kas').reset();
  document.getElementById('input-kas-tanggal').value = new Date().toISOString().split('T')[0];
  document.getElementById('modal-kas').classList.remove('hidden');
}

function closeModalKas() {
  document.getElementById('modal-kas').classList.add('hidden');
}

function handleSaveKas(event) {
  event.preventDefault();
  const nominal = Number(document.getElementById('input-kas-nominal').value);
  const tipe = document.getElementById('input-kas-tipe').value;
  const metodeBayar = document.getElementById('input-kas-metode')?.value || 'Kas di Bank (BCA)';
  const kategori = document.getElementById('input-kas-kategori').value;
  const keterangan = document.getElementById('input-kas-keterangan').value.trim();
  const pembayar = document.getElementById('input-kas-pembayar').value.trim();
  const tanggal = document.getElementById('input-kas-tanggal').value;

  if (!nominal || nominal <= 0 || !keterangan) {
    showToast('Harap masukkan nominal yang valid dan keterangan transaksi', 'error');
    return;
  }

  const isTunai = metodeBayar.toLowerCase().includes('tunai');
  const isQris = metodeBayar.toUpperCase().includes('QRIS');
  const kodeDebit = tipe === 'Pemasukan' ? (isTunai ? '1-101' : isQris ? '1-103' : '1-102') : '5-101';
  const kodeKredit = tipe === 'Pemasukan' ? (kategori.toLowerCase().includes('donasi') ? '4-102' : '4-101') : (isTunai ? '1-101' : isQris ? '1-103' : '1-102');

  SimStore.addTransaksi({
    tanggal,
    tipe,
    kategori,
    metodeBayar,
    kodeAkunDebit: kodeDebit,
    kodeAkunKredit: kodeKredit,
    nominal,
    keterangan,
    pembayar: pembayar || (tipe === 'Pemasukan' ? 'Warga RT' : 'Pengurus RT')
  });

  showToast('Transaksi kas berhasil dicatat!');
  closeModalKas();
  renderKeuangan();
  renderDashboard();
}

// --- MODAL TERIMA IURAN TUNAI LANGSUNG (DIRECT CASH ENTRY) ---
function openModalTerimaTunai() {
  const selectUnit = document.getElementById('input-tunai-unit');
  if (selectUnit) {
    const units = SimStore.getUnitRumah();
    selectUnit.innerHTML = '<option value="">-- Pilih Unit Rumah / Warga --</option>' +
      units.map(u => `<option value="${u.id}">${u.blok} No. ${u.nomorRumah} - ${u.namaPenghuni}</option>`).join('');
  }
  document.getElementById('form-terima-tunai').reset();
  document.getElementById('input-tunai-mulai-bulan').value = '2026-10';
  document.getElementById('input-tunai-durasi').value = '1';
  updateTunaiMultiBulan();
  document.getElementById('modal-terima-tunai').classList.remove('hidden');
}

function closeModalTerimaTunai() {
  document.getElementById('modal-terima-tunai').classList.add('hidden');
}

function onSelectTunaiUnit() {
  updateTunaiMultiBulan();
}

function updateTunaiMultiBulan() {
  const startVal = document.getElementById('input-tunai-mulai-bulan')?.value || '2026-10';
  const count = parseInt(document.getElementById('input-tunai-durasi')?.value || '1', 10);
  const settings = SimStore.getSettings();
  const tarif = Number(settings.tarifIuranBulanan) || 50000;

  const [startYearStr, startMonthStr] = startVal.split('-');
  let year = parseInt(startYearStr, 10);
  let month = parseInt(startMonthStr, 10);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthCodes = [];
  const monthLabels = [];

  for (let i = 0; i < count; i++) {
    let curMonth = month + i;
    let curYear = year;
    while (curMonth > 12) {
      curMonth -= 12;
      curYear += 1;
    }
    const mKey = `${curYear}-${String(curMonth).padStart(2, '0')}`;
    monthCodes.push(mKey);
    monthLabels.push(`${monthNames[curMonth - 1]} ${curYear}`);
  }

  const totalNominal = count * tarif;
  const hiddenInput = document.getElementById('input-tunai-periode-list');
  if (hiddenInput) hiddenInput.value = monthCodes.join(', ');

  const cakupanLabel = document.getElementById('label-tunai-cakupan');
  if (cakupanLabel) {
    if (count === 1) {
      cakupanLabel.textContent = `${monthLabels[0]} (1 Bulan)`;
    } else {
      cakupanLabel.textContent = `${monthLabels[0]} s/d ${monthLabels[monthLabels.length - 1]} (${count} Bulan)`;
    }
  }

  const nominalInput = document.getElementById('input-tunai-nominal');
  if (nominalInput) {
    nominalInput.value = totalNominal;
  }
}

function handleSaveIuranTunai(event) {
  event.preventDefault();
  const unitId = document.getElementById('input-tunai-unit').value;
  if (!unitId) {
    showToast('Harap pilih unit rumah / warga pembayar!', 'error');
    return;
  }

  const unit = SimStore.getUnitRumah().find(u => u.id === unitId);
  if (!unit) return;

  const periodeList = document.getElementById('input-tunai-periode-list').value;
  const nominal = Number(document.getElementById('input-tunai-nominal').value);
  const catatan = document.getElementById('input-tunai-catatan').value.trim();

  // 1. Catat ke Buku Kas RT (Akun 1-101 Kas Tunai)
  const newTrx = SimStore.addTransaksi({
    tanggal: new Date().toISOString().split('T')[0],
    tipe: 'Pemasukan',
    kategori: 'Iuran Bulanan',
    metodeBayar: 'Kas Tunai',
    kodeAkunDebit: '1-101',
    kodeAkunKredit: '4-101',
    nominal,
    keterangan: `Iuran Tunai ${periodeList} - ${unit.blok} No. ${unit.nomorRumah} (${unit.namaPenghuni})`,
    pembayar: `${unit.namaPenghuni} (${unit.blok} No. ${unit.nomorRumah})`
  });

  // 2. Simpan Bukti Bayar Terverifikasi Otomatis
  SimStore.addBuktiBayar({
    unitId: unit.id,
    nama: unit.namaPenghuni,
    blok: unit.blok,
    nomorRumah: unit.nomorRumah,
    periodeBulan: periodeList,
    nominal,
    tanggalBayar: new Date().toISOString().split('T')[0],
    nomorReferensi: `KWT-TUNAI-${Date.now().toString().slice(-6)}`,
    statusVerifikasi: 'Terverifikasi',
    transaksiId: newTrx.id,
    metodeBayar: 'Kas Tunai',
    imageHash: 'tunai_' + Date.now(),
    imageUrl: 'assets/img/kuitansi_tunai.png',
    catatan: catatan || 'Penerimaan iuran tunai langsung oleh Bendahara RT'
  });

  showToast(`Iuran tunai ${unit.namaPenghuni} sebesar ${formatRupiah(nominal)} berhasil dibukukan!`);
  closeModalTerimaTunai();
  renderKeuangan();
  renderDashboard();
  renderLaporanBlok();
  renderBuktiBayarTable();

  // Tawarkan Kirim Kuitansi via WhatsApp
  if (confirm(`Pencatatan iuran tunai ${unit.namaPenghuni} berhasil dibukukan!\nKirim kuitansi tanda terima resmi via WhatsApp ke warga?`)) {
    kirimKuitansiTunaiWa(unit, periodeList, nominal);
  }
}

function kirimKuitansiTunaiWa(unit, periodeList, nominal) {
  const settings = SimStore.getSettings();
  const noHp = unit?.noHp ? unit.noHp.replace(/[^0-9]/g, '') : '';
  const message = `*TANDA TERIMA RESMI IURAN TUNAI*\n` +
    `${settings.namaRt} / ${settings.namaRw} ${settings.kelurahan}\n\n` +
    `Kepada Yth: Bpk/Ibu ${unit.namaPenghuni} (${unit.blok} No. ${unit.nomorRumah})\n` +
    `Status: *LUNAS (SETORAN TUNAI LANGSUNG)*\n` +
    `Metode: Kas di Tangan / Tunai (Akun 1-101)\n` +
    `Periode: ${periodeList}\n` +
    `Nominal: ${formatRupiah(nominal)}\n` +
    `Tanggal Terima: ${formatDate(new Date().toISOString().split('T')[0])}\n` +
    `Penerima: Bendahara Kas RT\n\n` +
    `Terima kasih atas pembayaran iuran lingkungan Anda.`;

  const encoded = encodeURIComponent(message);
  const waUrl = noHp ? `https://wa.me/${noHp}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  window.open(waUrl, '_blank');
}

function deleteTransaksi(id) {
  if (confirm('Hapus pencatatan transaksi ini?')) {
    SimStore.deleteTransaksi(id);
    showToast('Transaksi dihapus');
    renderKeuangan();
    renderDashboard();
  }
}

// --- LAYANAN SURAT PENGANTAR RT/RW MODULE ---
function renderSurat() {
  const suratList = SimStore.getSurat();
  const tableBody = document.getElementById('table-surat-body');

  if (suratList.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400">Belum ada permohonan surat pengantar.</td></tr>`;
    return;
  }

  tableBody.innerHTML = suratList.map((s, idx) => `
    <tr class="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
      <td class="py-3 px-4 text-xs font-medium text-slate-400">${idx + 1}</td>
      <td class="py-3 px-4">
        <span class="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">${s.nomorSurat}</span>
        <div class="text-xs text-slate-400 mt-1">${formatDate(s.tanggal)}</div>
      </td>
      <td class="py-3 px-4">
        <div class="font-semibold text-slate-800 text-sm">${s.nama}</div>
        <div class="text-xs text-slate-400">NIK: ${s.nik}</div>
      </td>
      <td class="py-3 px-4 text-sm text-slate-700">${s.keperluan}</td>
      <td class="py-3 px-4">
        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}">
          ${s.status}
        </span>
      </td>
      <td class="py-3 px-4 text-xs text-slate-500">${s.keterangan || '-'}</td>
      <td class="py-3 px-4 text-right">
        <div class="inline-flex items-center gap-1.5">
          <button onclick="previewSuratPrint('${s.id}')" class="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 font-medium text-xs flex items-center gap-1 border border-blue-200" title="Cetak Surat">
            <i data-lucide="printer" class="w-3.5 h-3.5"></i>
            <span>Cetak</span>
          </button>
          <button onclick="deleteSurat('${s.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50" title="Hapus">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function openModalSurat() {
  const form = document.getElementById('form-surat');
  form.reset();

  // Populate warga dropdown
  const wargaList = SimStore.getWarga();
  const selectWarga = document.getElementById('input-surat-warga');
  selectWarga.innerHTML = `<option value="">-- Pilih Warga Pemohon --</option>` + wargaList.map(w => `
    <option value="${w.id}">${w.nama} (NIK: ${w.nik})</option>
  `).join('');

  // Auto-generate nomor surat
  const now = new Date();
  const romanMonth = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][now.getMonth()];
  const count = SimStore.getSurat().length + 1;
  const numPad = String(count).padStart(3, '0');
  const settings = SimStore.getSettings();
  document.getElementById('input-surat-nomor').value = `470/${numPad}/${settings.namaRt.replace(' ', '.')}-${settings.namaRw.replace(' ', '.')}/${romanMonth}/${now.getFullYear()}`;
  document.getElementById('input-surat-tanggal').value = now.toISOString().split('T')[0];

  document.getElementById('modal-surat').classList.remove('hidden');
}

function closeModalSurat() {
  document.getElementById('modal-surat').classList.add('hidden');
}

function handleSaveSurat(event) {
  event.preventDefault();
  const wargaId = document.getElementById('input-surat-warga').value;
  const nomorSurat = document.getElementById('input-surat-nomor').value.trim();
  const keperluan = document.getElementById('input-surat-keperluan').value.trim();
  const tanggal = document.getElementById('input-surat-tanggal').value;
  const keterangan = document.getElementById('input-surat-keterangan').value.trim();

  if (!wargaId || !keperluan) {
    showToast('Harap pilih warga pemohon dan isi keperluan surat!', 'error');
    return;
  }

  const warga = SimStore.getWarga().find(w => w.id === wargaId);
  if (!warga) return;

  const newSurat = SimStore.addSurat({
    nomorSurat,
    tanggal,
    wargaId: warga.id,
    nama: warga.nama,
    nik: warga.nik,
    keperluan,
    status: 'Disetujui',
    keterangan
  });

  showToast('Surat pengantar berhasil dibuat!');
  closeModalSurat();
  renderSurat();
  renderDashboard();

  // Prompt preview langsung
  previewSuratPrint(newSurat.id);
}

function previewSuratPrint(suratId) {
  const surat = SimStore.getSurat().find(s => s.id === suratId);
  if (!surat) return;

  const warga = SimStore.getWarga().find(w => w.id === surat.wargaId) || {
    nama: surat.nama,
    nik: surat.nik,
    jenisKelamin: 'Laki-laki',
    tempatLahir: 'Cimahi',
    tanggalLahir: '1995-01-01',
    agama: 'Islam',
    pekerjaan: 'Wiraswasta',
    statusPerkawinan: 'Kawin',
    alamat: 'Jl. Merak RT 03 RW 07'
  };

  const settings = SimStore.getSettings();
  const printArea = document.getElementById('printable-surat');

  printArea.innerHTML = `
    <div class="p-8 max-w-3xl mx-auto bg-white text-slate-900 font-serif leading-relaxed text-sm">
      <!-- Kop Surat -->
      <div class="kop-surat text-center mb-6 border-b-2 border-black pb-3">
        <h4 class="text-xs uppercase tracking-widest font-sans font-semibold">RUKUN TETANGGA ${settings.namaRt} / RUKUN WARGA ${settings.namaRw}</h4>
        <h2 class="text-lg font-bold uppercase font-sans tracking-wide">KELURAHAN / DESA ${settings.kelurahan}</h2>
        <p class="text-xs text-slate-600 font-sans">Kecamatan ${settings.kecamatan}, ${settings.kota} - ${settings.provinsi} ${settings.kodePos}</p>
      </div>

      <!-- Judul Surat -->
      <div class="text-center mb-6">
        <h3 class="text-base font-bold underline uppercase tracking-wide">SURAT PENGANTAR</h3>
        <p class="text-xs font-sans mt-0.5">Nomor: ${surat.nomorSurat}</p>
      </div>

      <!-- Isi Surat -->
      <p class="mb-4 text-justify">
        Yang bertanda tangan di bawah ini Ketua Rukun Tetangga (RT) ${settings.namaRt} / RW ${settings.namaRw} Kelurahan ${settings.kelurahan}, Kecamatan ${settings.kecamatan}, ${settings.kota}, dengan ini menerangkan bahwa:
      </p>

      <table class="w-full mb-5 text-sm ml-4">
        <tbody>
          <tr><td class="w-44 py-1 text-slate-700">Nama Lengkap</td><td class="w-4 py-1">:</td><td class="font-bold py-1">${warga.nama}</td></tr>
          <tr><td class="py-1 text-slate-700">Nomor Induk Kependudukan (NIK)</td><td class="py-1">:</td><td class="py-1 font-mono">${warga.nik}</td></tr>
          <tr><td class="py-1 text-slate-700">Tempat, Tanggal Lahir</td><td class="py-1">:</td><td class="py-1">${warga.tempatLahir || '-'}, ${formatDate(warga.tanggalLahir)}</td></tr>
          <tr><td class="py-1 text-slate-700">Jenis Kelamin</td><td class="py-1">:</td><td class="py-1">${warga.jenisKelamin}</td></tr>
          <tr><td class="py-1 text-slate-700">Agama</td><td class="py-1">:</td><td class="py-1">${warga.agama || '-'}</td></tr>
          <tr><td class="py-1 text-slate-700">Pekerjaan</td><td class="py-1">:</td><td class="py-1">${warga.pekerjaan || '-'}</td></tr>
          <tr><td class="py-1 text-slate-700">Status Perkawinan</td><td class="py-1">:</td><td class="py-1">${warga.statusPerkawinan || '-'}</td></tr>
          <tr><td class="py-1 text-slate-700 align-top">Alamat Domisili</td><td class="py-1 align-top">:</td><td class="py-1 align-top">${warga.alamat || '-'}</td></tr>
        </tbody>
      </table>

      <p class="mb-3 text-justify">
        Adalah benar warga yang berdomisili di lingkungan kami dan tercatat sebagai warga RT ${settings.namaRt} / RW ${settings.namaRw}. Surat pengantar ini dibuat untuk keperluan:
      </p>

      <div class="bg-slate-50 border border-slate-200 p-3 rounded-lg font-sans font-semibold text-center mb-5 text-slate-800">
        "${surat.keperluan}"
      </div>

      <p class="mb-8 text-justify">
        Demikian surat pengantar ini kami berikan kepada yang bersangkutan untuk dapat dipergunakan sebagaimana mestinya dan sesuai dengan ketentuan peraturan perundang-undangan yang berlaku.
      </p>

      <!-- Tanda Tangan -->
      <div class="flex justify-between items-start text-center font-sans mt-8 pt-4">
        <div>
          <p class="text-xs text-slate-600 mb-1">Mengetahui,</p>
          <p class="text-xs font-bold uppercase mb-16">Ketua RW ${settings.namaRw}</p>
          <p class="font-bold underline text-sm">(${settings.namaKetuaRw})</p>
        </div>
        <div>
          <p class="text-xs text-slate-600 mb-1">${settings.kota}, ${formatDate(surat.tanggal)}</p>
          <p class="text-xs font-bold uppercase mb-16">Ketua RT ${settings.namaRt}</p>
          <p class="font-bold underline text-sm">(${settings.namaKetuaRt})</p>
        </div>
      </div>
    </div>
  `;

  document.getElementById('modal-preview-surat').classList.remove('hidden');
}

function closePreviewSurat() {
  document.getElementById('modal-preview-surat').classList.add('hidden');
}

function deleteSurat(id) {
  if (confirm('Hapus arsip surat pengantar ini?')) {
    SimStore.deleteSurat(id);
    showToast('Surat dihapus');
    renderSurat();
    renderDashboard();
  }
}

// --- TAMU & WARGA SEMENTARA MODULE ---
function renderTamu() {
  const tamuList = SimStore.getTamu();
  const tableBody = document.getElementById('table-tamu-body');

  if (tamuList.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400">Belum ada pencatatan tamu atau anak kontrakan/kost.</td></tr>`;
    return;
  }

  tableBody.innerHTML = tamuList.map((t, idx) => `
    <tr class="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
      <td class="py-3 px-4 text-xs font-medium text-slate-400">${idx + 1}</td>
      <td class="py-3 px-4">
        <div class="font-semibold text-slate-800 text-sm">${t.nama}</div>
        <div class="text-xs text-slate-400">NIK: ${t.nik || '-'} • HP: ${t.noHp || '-'}</div>
      </td>
      <td class="py-3 px-4">
        <span class="px-2.5 py-0.5 rounded-full text-xs font-medium ${t.jenis.includes('Tamu') ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}">
          ${t.jenis}
        </span>
      </td>
      <td class="py-3 px-4 text-xs text-slate-600">${t.asal || '-'}</td>
      <td class="py-3 px-4 text-xs text-slate-700">${t.alamatTujuan}</td>
      <td class="py-3 px-4 text-xs text-slate-500">
        <div>Tgl Masuk: ${formatDate(t.tanggalMasuk)}</div>
        <div>Durasi: ${t.durasi || '-'}</div>
      </td>
      <td class="py-3 px-4 text-right">
        <button onclick="deleteTamu('${t.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50" title="Hapus">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </td>
    </tr>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function openModalTamu() {
  document.getElementById('form-tamu').reset();
  document.getElementById('input-tamu-tgl').value = new Date().toISOString().split('T')[0];
  document.getElementById('modal-tamu').classList.remove('hidden');
}

function closeModalTamu() {
  document.getElementById('modal-tamu').classList.add('hidden');
}

function handleSaveTamu(event) {
  event.preventDefault();
  const nama = document.getElementById('input-tamu-nama').value.trim();
  const nik = document.getElementById('input-tamu-nik').value.trim();
  const jenis = document.getElementById('input-tamu-jenis').value;
  const noHp = document.getElementById('input-tamu-hp').value.trim();
  const asal = document.getElementById('input-tamu-asal').value.trim();
  const alamatTujuan = document.getElementById('input-tamu-tujuan').value.trim();
  const tanggalMasuk = document.getElementById('input-tamu-tgl').value;
  const durasi = document.getElementById('input-tamu-durasi').value.trim();

  if (!nama || !alamatTujuan) {
    showToast('Nama dan alamat tujuan/tuan rumah wajib diisi!', 'error');
    return;
  }

  SimStore.addTamu({
    nama,
    nik,
    jenis,
    noHp,
    asal,
    alamatTujuan,
    tanggalMasuk,
    durasi,
    status: 'Aktif'
  });

  showToast('Data tamu/penghuni sementara dicatat!');
  closeModalTamu();
  renderTamu();
  renderDashboard();
}

function deleteTamu(id) {
  if (confirm('Hapus riwayat tamu ini?')) {
    SimStore.deleteTamu(id);
    showToast('Data tamu dihapus');
    renderTamu();
    renderDashboard();
  }
}

// --- KEAMANAN & POS RONDA MODULE ---
function renderKeamanan() {
  const rondaList = SimStore.getRonda();
  const laporanList = SimStore.getLaporanKeamanan();

  // Render Tabel Jadwal Ronda
  const rondaContainer = document.getElementById('container-jadwal-ronda');
  rondaContainer.innerHTML = rondaList.map(r => `
    <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">${r.hari}</span>
          <span class="text-xs text-slate-500 font-mono">${r.jam}</span>
        </div>
        <h4 class="font-bold text-slate-800 text-sm mb-1">${r.regu}</h4>
        <p class="text-xs text-slate-600 mb-2">Koordinator: <strong class="text-slate-800">${r.koordinator}</strong></p>
        <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
          <span class="font-medium text-slate-400 block mb-0.5">Petugas Jaga:</span>
          ${r.anggota}
        </div>
      </div>
      <button onclick="openModalEditRonda('${r.id}')" class="mt-3 w-full py-1.5 px-3 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 text-xs font-medium transition-colors">
        Edit Jadwal
      </button>
    </div>
  `).join('');

  // Render Laporan Keamanan
  const laporanBody = document.getElementById('table-laporan-keamanan-body');
  if (laporanList.length === 0) {
    laporanBody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400">Belum ada laporan keamanan.</td></tr>`;
  } else {
    laporanBody.innerHTML = laporanList.map((lk, idx) => `
      <tr class="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
        <td class="py-3 px-4 text-xs font-medium text-slate-400">${idx + 1}</td>
        <td class="py-3 px-4 text-xs font-medium text-slate-700">
          <div>${formatDate(lk.tanggal)}</div>
          <div class="text-slate-400 font-mono">${lk.jam} WIB</div>
        </td>
        <td class="py-3 px-4">
          <div class="font-semibold text-slate-800 text-xs">${lk.pelapor}</div>
          <div class="text-xs text-slate-400">${lk.lokasi || '-'}</div>
        </td>
        <td class="py-3 px-4 text-xs font-medium text-slate-800">${lk.jenisKejadian}</td>
        <td class="py-3 px-4 text-xs text-slate-600">${lk.catatan}</td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded-full text-xs font-medium ${lk.status.includes('Aman') ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}">
            ${lk.status}
          </span>
        </td>
      </tr>
    `).join('');
  }

  if (window.lucide) lucide.createIcons();
}

function openModalEditRonda(id) {
  AppState.editingRondaId = id;
  const ronda = SimStore.getRonda().find(r => r.id === id);
  if (!ronda) return;

  document.getElementById('edit-ronda-hari').textContent = ronda.hari;
  document.getElementById('input-ronda-regu').value = ronda.regu;
  document.getElementById('input-ronda-koordinator').value = ronda.koordinator;
  document.getElementById('input-ronda-anggota').value = ronda.anggota;
  document.getElementById('input-ronda-jam').value = ronda.jam;

  document.getElementById('modal-edit-ronda').classList.remove('hidden');
}

function closeModalEditRonda() {
  document.getElementById('modal-edit-ronda').classList.add('hidden');
  AppState.editingRondaId = null;
}

function handleSaveRonda(event) {
  event.preventDefault();
  if (!AppState.editingRondaId) return;

  SimStore.updateRonda(AppState.editingRondaId, {
    regu: document.getElementById('input-ronda-regu').value.trim(),
    koordinator: document.getElementById('input-ronda-koordinator').value.trim(),
    anggota: document.getElementById('input-ronda-anggota').value.trim(),
    jam: document.getElementById('input-ronda-jam').value.trim()
  });

  showToast('Jadwal ronda berhasil diperbarui!');
  closeModalEditRonda();
  renderKeamanan();
}

function openModalLaporKeamanan() {
  document.getElementById('form-laporan-keamanan').reset();
  const now = new Date();
  document.getElementById('input-lk-tanggal').value = now.toISOString().split('T')[0];
  document.getElementById('input-lk-jam').value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  document.getElementById('modal-lapor-keamanan').classList.remove('hidden');
}

function closeModalLaporKeamanan() {
  document.getElementById('modal-lapor-keamanan').classList.add('hidden');
}

function handleSaveLaporanKeamanan(event) {
  event.preventDefault();
  const pelapor = document.getElementById('input-lk-pelapor').value.trim();
  const jenisKejadian = document.getElementById('input-lk-jenis').value;
  const catatan = document.getElementById('input-lk-catatan').value.trim();
  const lokasi = document.getElementById('input-lk-lokasi').value.trim();
  const status = document.getElementById('input-lk-status').value;
  const tanggal = document.getElementById('input-lk-tanggal').value;
  const jam = document.getElementById('input-lk-jam').value;

  if (!pelapor || !catatan) {
    showToast('Harap lengkapi nama pelapor dan rincian catatan!', 'error');
    return;
  }

  SimStore.addLaporanKeamanan({
    pelapor,
    jenisKejadian,
    lokasi,
    status,
    tanggal,
    jam,
    catatan
  });

  showToast('Laporan keamanan berhasil disimpan!');
  closeModalLaporKeamanan();
  renderKeamanan();
}

// --- PENGATURAN RT MODULE ---
function renderSettings() {
  const settings = SimStore.getSettings();
  document.getElementById('set-nama-rt').value = settings.namaRt || '';
  document.getElementById('set-nama-rw').value = settings.namaRw || '';
  document.getElementById('set-kelurahan').value = settings.kelurahan || '';
  document.getElementById('set-kecamatan').value = settings.kecamatan || '';
  document.getElementById('set-kota').value = settings.kota || '';
  document.getElementById('set-provinsi').value = settings.provinsi || '';
  document.getElementById('set-kodepos').value = settings.kodePos || '';
  document.getElementById('set-ketua-rt').value = settings.namaKetuaRt || '';
  document.getElementById('set-kontak-rt').value = settings.kontakKetuaRt || '';
  document.getElementById('set-ketua-rw').value = settings.namaKetuaRw || '';
  document.getElementById('set-iuran').value = settings.tarifIuranBulanan || 50000;
  document.getElementById('set-saldo-awal').value = settings.saldoAwal || 0;

  // Cloud Sync Settings
  const cloudConfig = SimStore.getCloudConfig();
  const syncEnabledEl = document.getElementById('cloud-sync-enabled');
  if (syncEnabledEl) syncEnabledEl.checked = !!cloudConfig.enabled;
  const providerEl = document.getElementById('cloud-provider');
  if (providerEl) providerEl.value = cloudConfig.provider || 'supabase';
  const endpointEl = document.getElementById('cloud-endpoint-url');
  if (endpointEl) endpointEl.value = cloudConfig.endpointUrl || '';
  const apiKeyEl = document.getElementById('cloud-api-key');
  if (apiKeyEl) apiKeyEl.value = cloudConfig.apiKey || '';
  const tenantEl = document.getElementById('cloud-tenant-id');
  if (tenantEl) tenantEl.value = cloudConfig.tenantId || 'KL-SUKAMAJU-RW07-RT03';
  updateCloudSyncBadge();
}

function updateCloudSyncBadge() {
  const badge = document.getElementById('cloud-status-badge');
  if (!badge) return;
  const config = SimStore.getCloudConfig();
  const isHosted = SimStore.isHostedMode();

  if (!isHosted) {
    badge.className = 'px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200';
    badge.textContent = 'Mode Lokal (file:///)';
  } else if (!config.enabled) {
    badge.className = 'px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200';
    badge.textContent = 'Cloud Non-Aktif';
  } else if (config.syncStatus === 'online') {
    badge.className = 'px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200';
    badge.textContent = 'Cloud Terhubung';
  } else if (config.syncStatus === 'syncing') {
    badge.className = 'px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse';
    badge.textContent = 'Menyinkronkan...';
  } else {
    badge.className = 'px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200';
    badge.textContent = 'Siap Sinkron';
  }
}

async function handleTestCloudConnection() {
  const resultEl = document.getElementById('cloud-test-result');
  if (!resultEl) return;
  resultEl.classList.remove('hidden', 'bg-emerald-50', 'text-emerald-700', 'border-emerald-200', 'bg-rose-50', 'text-rose-700', 'border-rose-200');
  resultEl.classList.add('bg-blue-50', 'text-blue-700', 'border-blue-200');
  resultEl.textContent = 'Menguji koneksi ke endpoint cloud...';

  const testConfig = {
    enabled: true,
    provider: document.getElementById('cloud-provider').value,
    endpointUrl: document.getElementById('cloud-endpoint-url').value.trim(),
    apiKey: document.getElementById('cloud-api-key').value.trim(),
    tenantId: document.getElementById('cloud-tenant-id').value.trim()
  };

  const res = await SimStore.testCloudConnection(testConfig);
  resultEl.classList.remove('bg-blue-50', 'text-blue-700', 'border-blue-200');
  if (res.ok) {
    resultEl.classList.add('bg-emerald-50', 'text-emerald-700', 'border-emerald-200');
    resultEl.textContent = `✓ ${res.message}`;
  } else {
    resultEl.classList.add('bg-rose-50', 'text-rose-700', 'border-rose-200');
    resultEl.textContent = `✕ ${res.message}`;
  }
}

async function handleSaveCloudConfig() {
  const config = {
    enabled: document.getElementById('cloud-sync-enabled').checked,
    provider: document.getElementById('cloud-provider').value,
    endpointUrl: document.getElementById('cloud-endpoint-url').value.trim(),
    apiKey: document.getElementById('cloud-api-key').value.trim(),
    tenantId: document.getElementById('cloud-tenant-id').value.trim()
  };
  SimStore.saveCloudConfig(config);
  updateCloudSyncBadge();
  showToast('Pengaturan Cloud Sync berhasil disimpan!');

  if (config.enabled && config.endpointUrl) {
    showToast('Memulai sinkronisasi data cloud...');
    const res = await SimStore.syncRemote();
    if (res.success) {
      showToast(`Sinkronisasi selesai! ${res.mergeCount || 0} bukti transfer diperbarui.`);
      renderBuktiBayarTable();
      renderDashboard();
    } else {
      showToast(res.error || 'Gagal menyinkronkan data cloud.', 'error');
    }
  }
}

function handleSaveSettings(event) {
  event.preventDefault();
  const settings = {
    namaRt: document.getElementById('set-nama-rt').value.trim(),
    namaRw: document.getElementById('set-nama-rw').value.trim(),
    kelurahan: document.getElementById('set-kelurahan').value.trim(),
    kecamatan: document.getElementById('set-kecamatan').value.trim(),
    kota: document.getElementById('set-kota').value.trim(),
    provinsi: document.getElementById('set-provinsi').value.trim(),
    kodePos: document.getElementById('set-kodepos').value.trim(),
    namaKetuaRt: document.getElementById('set-ketua-rt').value.trim(),
    kontakKetuaRt: document.getElementById('set-kontak-rt').value.trim(),
    namaKetuaRw: document.getElementById('set-ketua-rw').value.trim(),
    tarifIuranBulanan: Number(document.getElementById('set-iuran').value),
    saldoAwal: Number(document.getElementById('set-saldo-awal').value)
  };

  SimStore.saveSettings(settings);
  showToast('Pengaturan RT/RW berhasil disimpan!');
  renderDashboard();
}

// --- EKSPOR / IMPOR MODULE ---
function exportWargaCSV() {
  const wargaList = SimStore.getWarga();
  if (wargaList.length === 0) {
    showToast('Data warga kosong', 'error');
    return;
  }

  const headers = ['NIK', 'No KK', 'Nama Lengkap', 'Jenis Kelamin', 'Tempat Lahir', 'Tanggal Lahir', 'Agama', 'Pendidikan', 'Pekerjaan', 'Status Perkawinan', 'Status Keluarga', 'Status Tinggal', 'Alamat', 'No HP', 'Golongan Darah'];
  const rows = wargaList.map(w => [
    `"${w.nik || ''}"`,
    `"${w.noKk || ''}"`,
    `"${w.nama || ''}"`,
    `"${w.jenisKelamin || ''}"`,
    `"${w.tempatLahir || ''}"`,
    `"${w.tanggalLahir || ''}"`,
    `"${w.agama || ''}"`,
    `"${w.pendidikan || ''}"`,
    `"${w.pekerjaan || ''}"`,
    `"${w.statusPerkawinan || ''}"`,
    `"${w.statusKeluarga || ''}"`,
    `"${w.statusTinggal || ''}"`,
    `"${w.alamat || ''}"`,
    `"${w.noHp || ''}"`,
    `"${w.golDarah || ''}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `data_warga_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Data warga berhasil diunduh (CSV/Excel)!');
}

function exportKasCSV() {
  const transaksiList = SimStore.getTransaksi();
  if (transaksiList.length === 0) {
    showToast('Data kas kosong', 'error');
    return;
  }

  const headers = ['Tanggal', 'Tipe', 'Kategori', 'Nominal', 'Keterangan', 'Pihak'];
  const rows = transaksiList.map(t => [
    `"${t.tanggal}"`,
    `"${t.tipe}"`,
    `"${t.kategori}"`,
    `"${t.nominal}"`,
    `"${t.keterangan}"`,
    `"${t.pembayar || ''}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `laporan_kas_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Laporan kas berhasil diunduh (CSV)!');
}

function downloadBackupJSON() {
  const jsonStr = SimStore.exportBackupJSON();
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `simwarga_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast('File backup database JSON berhasil diunduh!');
}

function triggerImportJSON() {
  document.getElementById('input-import-file').click();
}

function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const success = SimStore.importBackupJSON(e.target.result);
    if (success) {
      showToast('Database berhasil dipulihkan dari file backup!');
      renderDashboard();
      if (AppState.currentTab !== 'dashboard') switchTab(AppState.currentTab);
    } else {
      showToast('Gagal memulihkan database. Format JSON tidak sesuai.', 'error');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function resetToDefaultDatabase() {
  if (confirm('PERINGATAN: Tindakan ini akan mengembalikan seluruh data ke data bawaan awal (sample data). Lanjutkan?')) {
    SimStore.resetAll();
    showToast('Database telah di-reset ke data default.');
    location.reload();
  }
}

// Initializer on Page Load
document.addEventListener('DOMContentLoaded', () => {
  // Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Setup view
  renderDashboard();

  // Search warga listener
  const searchInput = document.getElementById('search-warga');
  if (searchInput) {
    searchInput.addEventListener('input', () => renderWarga());
  }

  // Mobile menu toggle
  const mobileToggleBtn = document.getElementById('mobile-menu-toggle');
  const sidebar = document.getElementById('app-sidebar');
  if (mobileToggleBtn && sidebar) {
    mobileToggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
    });
  }

  // Inisialisasi Runtime Mode Badge (Hosted Web vs Standalone)
  const badgeRuntimeDot = document.getElementById('badge-runtime-dot');
  const badgeRuntimeText = document.getElementById('badge-runtime-text');
  const badgeRuntimeMode = document.getElementById('badge-runtime-mode');
  if (badgeRuntimeMode && badgeRuntimeDot && badgeRuntimeText) {
    if (SimStore.isHostedMode()) {
      badgeRuntimeDot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
      badgeRuntimeText.textContent = 'Mode Hosted Web';
      badgeRuntimeMode.className = 'hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200';
    } else {
      badgeRuntimeDot.className = 'w-2 h-2 rounded-full bg-slate-400';
      badgeRuntimeText.textContent = 'Mode Standalone (file:///)';
      badgeRuntimeMode.className = 'hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200';
    }
  }

  // Listener event sinkronisasi cloud
  window.addEventListener('simwarga:synced', () => {
    const syncText = document.getElementById('sync-status-text');
    if (syncText) {
      const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      syncText.textContent = `Tersinkron: ${timeNow}`;
    }
    renderBuktiBayarTable();
    renderDashboard();
  });
});


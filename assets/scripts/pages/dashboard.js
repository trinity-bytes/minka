/**
 * T26 - Miguel Sanca: Lógica del Dashboard de Impacto
 * Maneja la visualización de KPIs, gráficas y filtros.
 */

document.addEventListener("DOMContentLoaded", () => {
  initDashboard();
});

// Mock Data Generator
function generateData(days) {
  const data = [];
  const categories = ["Ropa", "Electrónica", "Muebles", "Libros", "Juguetes"];
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Random chance of transaction
    if (Math.random() > 0.7) {
      const category =
        categories[Math.floor(Math.random() * categories.length)];
      data.push({
        date: date.toISOString().split("T")[0],
        category: category,
        co2: Math.floor(Math.random() * 15) + 1, // 1-15 kg
        water: Math.floor(Math.random() * 500) + 10, // 10-500 L
        items: 1,
      });
    }
  }
  return data;
}

let allData = [];
let evolutionChart = null;
let categoryChart = null;

function initDashboard() {
  // Generate 1 year of mock data
  allData = generateData(365);

  populateCategoryFilter();
  setupFilters();
  setupExport();

  // Set default dates for custom inputs
  const today = new Date().toISOString().split("T")[0];
  const lastMonth = new Date();
  lastMonth.setDate(lastMonth.getDate() - 30);

  const endDateInput = document.getElementById("end-date");
  const startDateInput = document.getElementById("start-date");

  if (endDateInput) endDateInput.value = today;
  if (startDateInput)
    startDateInput.value = lastMonth.toISOString().split("T")[0];

  updateDashboard();
}

function populateCategoryFilter() {
  const categories = [...new Set(allData.map((item) => item.category))].sort();
  const select = document.getElementById("category-filter");
  if (!select) return;

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

function setupFilters() {
  const periodSelect = document.getElementById("period-filter");
  const categorySelect = document.getElementById("category-filter");
  const customDateGroup = document.getElementById("custom-date-group");
  const startDateInput = document.getElementById("start-date");
  const endDateInput = document.getElementById("end-date");

  if (periodSelect) {
    periodSelect.addEventListener("change", (e) => {
      const isCustom = e.target.value === "custom";
      if (customDateGroup) {
        customDateGroup.style.display = isCustom ? "flex" : "none";
      }
      updateDashboard();
    });
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", () => updateDashboard());
  }

  if (startDateInput)
    startDateInput.addEventListener("change", () => updateDashboard());
  if (endDateInput)
    endDateInput.addEventListener("change", () => updateDashboard());
}

function setupExport() {
  const exportBtn = document.getElementById("export-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      alert(
        "Generando reporte PDF... (Simulación: El archivo se descargaría aquí)"
      );
    });
  }
}

function updateDashboard() {
  const periodSelect = document.getElementById("period-filter");
  const categorySelect = document.getElementById("category-filter");

  const periodValue = periodSelect ? periodSelect.value : "30";
  const categoryValue = categorySelect ? categorySelect.value : "all";

  const filteredData = filterData(allData, periodValue, categoryValue);

  const hasData = filteredData.length > 0;
  toggleEmptyState(!hasData);

  if (hasData) {
    updateKPIs(filteredData);
    // Pass periodValue to determine chart granularity
    const days =
      periodValue === "custom" ? getDaysDiff() : parseInt(periodValue);
    updateCharts(filteredData, days);
  }
}

function getDaysDiff() {
  const startInput = document.getElementById("start-date");
  const endInput = document.getElementById("end-date");
  if (!startInput || !endInput) return 30;

  const start = new Date(startInput.value);
  const end = new Date(endInput.value);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 30;
}

function toggleEmptyState(isEmpty) {
  const noDataMsg = document.getElementById("no-data-message");
  const kpiSection = document.getElementById("kpi-section");
  const chartsSection = document.getElementById("charts-section");

  if (noDataMsg) noDataMsg.style.display = isEmpty ? "flex" : "none";
  if (kpiSection) kpiSection.style.display = isEmpty ? "none" : "grid";
  if (chartsSection) chartsSection.style.display = isEmpty ? "none" : "grid";
}

function filterData(data, period, category) {
  let filtered = data;

  // Filter by Period
  if (period === "custom") {
    const startInput = document.getElementById("start-date");
    const endInput = document.getElementById("end-date");

    if (startInput && endInput && startInput.value && endInput.value) {
      const startDate = new Date(startInput.value);
      const endDate = new Date(endInput.value);
      // Adjust end date to include the full day
      endDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }
  } else {
    const days = parseInt(period);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    filtered = filtered.filter((item) => new Date(item.date) >= cutoffDate);
  }

  // Filter by Category
  if (category !== "all") {
    filtered = filtered.filter((item) => item.category === category);
  }

  return filtered;
}

function updateKPIs(data) {
  const totalCO2 = data.reduce((sum, item) => sum + item.co2, 0);
  const totalWater = data.reduce((sum, item) => sum + item.water, 0);
  const totalItems = data.reduce((sum, item) => sum + item.items, 0);

  animateValue("kpi-co2", totalCO2);
  animateValue("kpi-water", totalWater);
  animateValue("kpi-objects", totalItems);
}

function animateValue(id, end) {
  const obj = document.getElementById(id);
  if (!obj) return;

  const start = parseInt(obj.textContent.replace(/,/g, "")) || 0;
  if (start === end) return;

  const duration = 1000;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out quart
    const ease = 1 - Math.pow(1 - progress, 4);

    const current = Math.floor(start + (end - start) * ease);
    obj.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function updateCharts(data, days) {
  updateEvolutionChart(data, days);
  updateCategoryChart(data);
}

function updateEvolutionChart(data, days) {
  const ctx = document.getElementById("evolutionChart").getContext("2d");

  // Group by date (or month if period is long)
  const grouped = {};
  const isLongPeriod = days > 90;

  data.forEach((item) => {
    let key = item.date;
    if (isLongPeriod) {
      // Group by month YYYY-MM
      key = item.date.substring(0, 7);
    }

    if (!grouped[key]) grouped[key] = 0;
    grouped[key] += item.co2;
  });

  // Sort keys
  const labels = Object.keys(grouped).sort();
  const values = labels.map((k) => grouped[k]);

  // Format labels for display
  const displayLabels = labels.map((l) => {
    const d = new Date(l + (isLongPeriod ? "-01" : ""));
    return isLongPeriod
      ? d.toLocaleDateString("es-ES", { month: "short", year: "numeric" })
      : d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  });

  if (evolutionChart) {
    evolutionChart.destroy();
  }

  evolutionChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: displayLabels,
      datasets: [
        {
          label: "CO₂ Evitado (kg)",
          data: values,
          borderColor: "#2ECC71",
          backgroundColor: "rgba(46, 204, 113, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function updateCategoryChart(data) {
  const ctx = document.getElementById("categoryChart").getContext("2d");

  // Group by category
  const grouped = {};
  data.forEach((item) => {
    if (!grouped[item.category]) {
      grouped[item.category] = { co2: 0, water: 0 };
    }
    grouped[item.category].co2 += item.co2;
    grouped[item.category].water += item.water;
  });

  const labels = Object.keys(grouped);
  const co2Data = labels.map((k) => grouped[k].co2);
  const waterData = labels.map((k) => grouped[k].water);

  if (categoryChart) {
    categoryChart.destroy();
  }

  categoryChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "CO₂ (kg)",
          data: co2Data,
          backgroundColor: "#2ECC71",
        },
        {
          label: "Agua (L)",
          data: waterData,
          backgroundColor: "#3498db",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

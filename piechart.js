document.addEventListener("DOMContentLoaded", function() {
    // Get the canvas element for the doughnut chart
    var container = document.getElementById('doughnut-chart-container');

    // Find the canvas element within the container
    var canvas = container.querySelector('canvas');

    // Retrieve the 2D rendering context
    var ctx = canvas.getContext('2d');

  
    ctx.canvas.style.padding = '20px'; 
   
    var customerCounts = [20, 40, 100, 5]; // Replace with actual customer counts from database
  
    // Calculate the total customer count by summing up the customer counts
    var totalCustomers = customerCounts.reduce((acc, count) => acc + count, 0);
  
    // Display the total customer count
    document.getElementById('totalCustomers').textContent = totalCustomers;
  
    // Chart data
    var chartData = {
      labels: categories.map(category => category.name),
      datasets: [{
        data: customerCounts, // Use the customer counts for data
        backgroundColor: ['#24c59b', '#e06666', '#ffe599', '#6fa8dc'],
      }],
    };
  
    // Chart options
    const options = {
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: {
              usePointStyle: true,
              padding: 20,
              margin: {
                left: 20
              },
              font: {
                size: 16
              },

            },
          },
          tooltip: {
            enabled: false, // Disable tooltip
          },
          datalabels: {
            color: '#000000',
            formatter: (value, context) => {
              return ((value * 100 / totalCustomers).toFixed(0)) + '%';
            },
            align: 'center',
            anchor: 'center',
            font: {
              size: 14, // Adjust the font size as needed
            },
          },
        },
        maintainAspectRatio: true,
        cutout: '60%', // Adjust this value to control the cut-out size
      };
      
  
    // Create the Doughnut chart
    var myDoughnutChart = new Chart(ctx, {
      type: 'doughnut',
      data: chartData,
      options: options,
      plugins: [ChartDataLabels],
    });
  });
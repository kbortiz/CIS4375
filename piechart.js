document.addEventListener("DOMContentLoaded", function() {
    // Get the canvas element for the doughnut chart
    var ctx = document.getElementById('customerDoughnutChart').getContext('2d');
  
    ctx.canvas.style.padding = '20px'; 
    // Replace this sample data with your actual customer counts
    var customerCounts = [2, 20, 60, 5]; // Replace with your actual customer counts
  
    // Calculate the total customer count by summing up the customer counts
    var totalCustomers = customerCounts.reduce((acc, count) => acc + count, 0);
  
    // Display the total customer count
    document.getElementById('totalCustomers').textContent = totalCustomers;
  
    // Chart data
    var chartData = {
      labels: categories.map(category => category.name),
      datasets: [{
        data: customerCounts, // Use the customer counts for data
        backgroundColor: ['#24c59b', '#e06666', '#ffe599', '#0461b2'],
      }],
    };
  
    // Chart options
    var options = {
      cutoutPercentage: 80, // Adjust this value (0-100) to control the cut-out size,
      plugins: {
        legend: {
            display: true, // Show legend
            position: 'right', // Position it on the right side
            labels: {
             usePointStyle: true, // Use data point style as legend marker
            },
            padding:20,
        },
        datalabels: {
            color: '#000000', // Set label color
            formatter: (value) => {
              return (value * 100 / totalCustomers).toFixed(2) + '%'; // Display percentage
            },
            align: 'center',
            anchor: 'center',
            font: {
              size: 10, // Adjust the font size
              weight: 'bold',
          },
        },
      },
    };
  
    // Create the Doughnut chart
    var myDoughnutChart = new Chart(ctx, {
      type: 'doughnut',
      data: chartData,
      options: options,
    });
  });
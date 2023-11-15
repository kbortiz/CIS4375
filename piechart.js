document.addEventListener("DOMContentLoaded", function() {
  // Get the canvas element for the doughnut chart
  var container = document.getElementById('doughnut-chart-container');
  // Find the canvas element within the container
  var canvas = container.querySelector('canvas');
  // Retrieve the 2D rendering context
  var ctx = canvas.getContext('2d');

  ctx.canvas.style.padding = '20px';

  fetch('http://ec2-18-116-39-255.us-east-2.compute.amazonaws.com:8000/customercount')
  .then(response => response.json())
  .then(data => {
      console.log(data);
      var customerCounts = data; // Replace with actual customer counts from the database
      // Calculate the total customer count by summing up the customer counts
      var totalCustomers = customerCounts.reduce((acc, count) => acc + count, 0);
      console.log(customerCounts);
      console.log(totalCustomers);
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
                      left: 20,
                  },
                  font: {
                      size: 16,
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
          cutout: '60%',
      };

      // Create the Doughnut chart
      var myDoughnutChart = new Chart(ctx, {
          maintainAspectRatio: false,
          type: 'doughnut',
          data: chartData,
          options: options,
          plugins: [ChartDataLabels],
      });
  });
});
<template>
    <Line :data="chartData" :options="chartOptions" />
</template>
  
<script>
  import { Line } from 'vue-chartjs'
  import {Chart as ChartJS,CategoryScale,LinearScale,PointElement,LineElement,Title,Tooltip,Legend,Filler} from 'chart.js';
  ChartJS.register(CategoryScale,LinearScale,PointElement,LineElement,Title,Tooltip,Legend,Filler);
  
  export default {
    name: 'LineChart',
    components: { Line },
    props: {
        chartData: {
          type: Object,
          required: true
        },
        chartOptions: {
            type: Object,
            default: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                aspectRatio: 1/1,
            }
        }
    }
  }
</script>
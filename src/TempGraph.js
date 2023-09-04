import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Chart } from 'chart.js/auto';

function TempGraph({ city }) {
    const chartRef = useRef(null);
    const [temperatureData, setTemperatureData] = useState([]);
    const [chart, setChart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTemperatureData = async () => {
            try {
                const response = await axios.get(
                    `https://api.weatherbit.io/v2.0/forecast/hourly?city=${city}&hours=24&key=beac4cd310b0487e86c75b2824a225fe`
                );
                const data = response.data.data;

                const temperatureData = data.map((entry) => entry.temp);

                setTemperatureData(temperatureData);
                setLoading(false);
                setError(null);
            } catch (error) {
                console.error('Error fetching temperature data:', error);
                setLoading(false);
                setError('An error occurred while fetching data. Please try again.');
            }
        };

        fetchTemperatureData();
    }, [city]);

    useEffect(() => {
        if (chart) {
            chart.destroy();
        }

        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');

            const newChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: Array.from({ length: 24 }, (_, i) => `${i}h ago`),
                    datasets: [
                        {
                            label: 'Temperature (°C)',
                            data: temperatureData,
                            borderColor: 'rgb(75, 192, 192)',
                            borderWidth: 2,
                            fill: false,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Time (hours ago)',
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Temperature (°C)',
                            },
                        },
                    },
                },
            });

            setChart(newChart);
        }
    }, [temperatureData]);

    return (
        <div className="temperature-graph">
            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : (
                <canvas ref={chartRef}></canvas>
            )}
        </div>
    );
}

export default TempGraph;

// src/components/NigeriaMap.tsx
import React, { useEffect, useState, useRef } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartTooltip } from 'recharts';

const geoUrl = 'https://raw.githubusercontent.com/deldersveld/topojson/master/countries/nigeria/nigeria-states.json';

const NigeriaMap = () => {
  const [voterData, setVoterData] = useState<{ [state: string]: number }>({});
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const voterNumberRef = useRef(1);
  const [lastVoter, setLastVoter] = useState<{ state: string; number: number } | null>(null);
  const [voterHistory, setVoterHistory] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const states = [
        'Lagos', 'Kano', 'Kaduna', 'Rivers', 'Oyo', 'Katsina', 'Bauchi', 'Anambra', 'Benue', 'Borno',
        'Delta', 'Edo', 'Enugu', 'Imo', 'Kwara', 'Niger', 'Ondo', 'Osun', 'Plateau', 'Sokoto'
      ];

      const newData: { [state: string]: number } = { ...voterData };
      let total = totalVotes;

      const randomState = states[Math.floor(Math.random() * states.length)];
      newData[randomState] = (newData[randomState] || 0) + 1;
      total++;
      const voterNum = voterNumberRef.current;
      voterNumberRef.current++;

      setLastVoter({ state: randomState, number: voterNum });
      setVoterData(newData);
      setTotalVotes(total);
      setVoterHistory(prev => [`Voter #${voterNum.toLocaleString()} from ${randomState}`, ...prev.slice(0, 4)]);
      setShowModal(true);

      setTimeout(() => setShowModal(false), 3000);
    }, 2000);

    return () => clearInterval(interval);
  }, [voterData, totalVotes]);

  const colorScale = scaleLinear<string>()
    .domain([0, Math.max(...Object.values(voterData || { Lagos: 1000 }))])
    .range(['#E0F7FA', '#006064']);

  const pieData = Object.entries(voterData).map(([state, count]) => ({ name: state, value: count }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#D84315', '#4CAF50', '#8E24AA', '#1E88E5'];

  return (
    <div className="bg-white p-4 rounded shadow mb-4 relative">
      <h2 className="text-lg font-bold mb-4">🗺️ Voter Participation by State</h2>
      <ComposableMap projection="geoMercator" projectionConfig={{ scale: 1200 }} width={600} height={500}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const stateName = geo.properties.NAME_1;
              const count = voterData[stateName] || 0;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={colorScale(count)}
                  stroke="#FFF"
                  onMouseEnter={() => {
                    const tooltip = document.getElementById('tooltip');
                    if (tooltip) tooltip.innerText = `${stateName}: ${count.toLocaleString()} voters`;
                  }}
                  onMouseLeave={() => {
                    const tooltip = document.getElementById('tooltip');
                    if (tooltip) tooltip.innerText = '';
                  }}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: '#43A047', outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      <div id="tooltip" className="mt-2 text-sm text-gray-700"></div>

      {showModal && lastVoter && (
        <div className="fixed top-6 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded shadow-lg animate-slide-in-out">
          🎉 Vote recorded from <strong>{lastVoter.state}</strong> — Voter #{lastVoter.number.toLocaleString()}
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-md font-semibold mb-2">📊 Live Voter Turnout Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartTooltip />
          </PieChart>
        </ResponsiveContainer>
        <p className="text-center text-sm text-gray-600 mt-2">Total Votes: {totalVotes.toLocaleString()}</p>
        <div className="mt-4 text-sm text-gray-700">
          <h4 className="font-semibold mb-2">📥 Recent Voter Activity:</h4>
          <ul className="list-disc pl-5">
            {voterHistory.map((entry, index) => (
              <li key={index}>{entry}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NigeriaMap;

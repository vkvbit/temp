const express = require('express');
//Axios
const axios = require('axios');
//Constants
const PORT = 9090;
const HOST = '0.0.0.0';
// -----------------------
const cors = require('cors');
const bodyParser = require("body-parser");
const si = require('systeminformation');
const os = require('os');
// const Docker = require('dockerode');
//App
const app = express();
app.use(express.json());
app.disable('x-powered-by');

const corsOptions ={
  origin:['https://netsnare.emsec.dev', 'http://localhost:3001', 'https://www.illusioniq.com','https://app.illusioniq.com','http://localhost:3000'], 
  credentials:true,            
  optionSuccessStatus:200
}
app.use(cors(corsOptions));
// const docker = new Docker({ socketPath: '/var/run/docker.sock' });
app.get('/', (req, res) => {
    res.send('Agent Up');
});

app.get('/status', async (req, res) => {
    const result = await axios.get('http://elasticsearch:9200/')
    .then(response => {
        return response;
    }).catch(err => {
	console.log(err);
    });
    console.log(result.data);
    res.status(200).json(result.data);
});

app.post('/search1', async (req, res) => {
    const body = req.body;
    console.log(body);

    try {
        const result = await axios.post('http://elasticsearch:9200/filebeat-7.7.0/_search', body);
        // console.log(result.data);
        res.status(200).json(result.data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while processing your request', details: err.message });
    }
});

app.post('/slips_search', async (req, res) => {
  const body = req.body;
  console.log('Received request body:', body);

  try {
      // Query the Elasticsearch index for system_a
      const indexPattern = 'manni_test';
      const result = await axios.post(`http://elasticsearch:9200/${indexPattern}/_search`, body);

      // Send the search result as response
      res.status(200).json(result.data);
  } catch (err) {
      console.error('Error querying Elasticsearch:', err);
      res.status(500).json({ error: 'An error occurred while processing your request', details: err.message });
  }
});
app.post('/honeyplc_search', async (req, res) => {
    const body = req.body;
    console.log('Received request body:', body);
  
    try {
        // Query the Elasticsearch index for system_a
        const indexPattern = 'honeyplc';
        const result = await axios.post(`http://elasticsearch:9200/${indexPattern}/_search`, body);
  
        // Send the search result as response
        res.status(200).json(result.data);
    } catch (err) {
        console.error('Error querying Elasticsearch:', err);
        res.status(500).json({ error: 'An error occurred while processing your request', details: err.message });
    }
  });
  app.post('/scada_dnp3_search', async (req, res) => {
    const body = req.body;
    console.log('Received request body:', body);
  
    try {
        // Query the Elasticsearch index for system_a
        const indexPattern = 'scada_dnp3';
        const result = await axios.post(`http://elasticsearch:9200/${indexPattern}/_search`, body);
  
        // Send the search result as response
        res.status(200).json(result.data);
    } catch (err) {
        console.error('Error querying Elasticsearch:', err);
        res.status(500).json({ error: 'An error occurred while processing your request', details: err.message });
    }
  });
  app.post('/gridpot_search', async (req, res) => {
    const body = req.body;
    console.log('Received request body:', body);
  
    try {
        // Query the Elasticsearch index for system_a
        const indexPattern = 'gridpot';
        const result = await axios.post(`http://elasticsearch:9200/${indexPattern}/_search`, body);
  
        // Send the search result as response
        res.status(200).json(result.data);
    } catch (err) {
        console.error('Error querying Elasticsearch:', err);
        res.status(500).json({ error: 'An error occurred while processing your request', details: err.message });
    }
  });
// ------------------------------------------------------------------


// Function to check disk usage asynchronously
let prevCPUUsage =  calculateCPUUsage();
async function checkDiskUsage() {
  try {
    const data = await si.fsSize();
    const diskUsage = data.reduce((acc, curr) => {
      acc.totalSize += curr.size;
      acc.used += curr.used;
      acc.available += curr.available;
      return acc;
    }, { totalSize: 0, used: 0, available: 0 });

    const freeDisk = diskUsage.available;
    const usedDisk = diskUsage.used;
    const totalDisk = diskUsage.totalSize;

    const result = {
      totalFree: freeDisk,
      totalUsed: usedDisk,
      totalAvailable: totalDisk
    };
    return result;
  } catch (error) {
    console.error('Error fetching disk usage:', error.message);
    throw new Error('Error fetching disk usage: ' + error.message);
  }
}

// / Function to calculate CPU usage
function calculateCPUUsage() {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach(cpu => {
    for (let type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });

  return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
}
async function getContainerHealth() {
  try {
      const containers = await docker.listContainers({ all: true });
      const containerHealth = await Promise.all(containers.map(async (containerInfo) => {
          const container = docker.getContainer(containerInfo.Id);
          const stats = await container.stats({ stream: false });
          // Memory usage
          const memoryStats = stats.memory_stats;
          const memoryUsage = memoryStats.usage / (1024 ** 2); 
          const memoryLimit = memoryStats.limit / (1024 ** 2); 

          //container CPU usage
          
          // const cpuStats = stats.cpu_stats;
          // console.log("cpuStats:",cpuStats)
          // const cpuDelta = cpuStats.cpu_usage.total_usage / 1000000000; 
          // const systemDelta = cpuStats.system_cpu_usage / 1000000000; 

          // let cpuUsage;
          // if (systemDelta !== 0) {
          //     const perCpuUsage = cpuStats.cpu_usage.percpu_usage.reduce((acc, curr) => acc + curr, 0) / 1000000000; 
          //     const availableCPUs = cpuStats.online_cpus; 
          //     cpuUsage = (cpuDelta / systemDelta) * perCpuUsage / availableCPUs * 100;
          // } else {
          //     cpuUsage = NaN; 
          // }

          // const formattedCpuUsage = isNaN(cpuUsage) ? 'N/A' : `${cpuUsage.toFixed(2)}%`;
          // const cpuUsageWithPercentage = isNaN(cpuUsage) ? 'N/A' : `${formattedCpuUsage}%`;



          // Disk usage (assuming the container has a writable layer)
          const blkioStats = stats.blkio_stats;
          const diskUsageGB = blkioStats.io_service_bytes_recursive.reduce((acc, curr) => acc + curr.value, 0) / (1024 ** 3);
          const details = await container.inspect();
          return {
              id: containerInfo.Id,
              name: containerInfo.Names.join(', '),
              health: details.State?.Health?.Status,
              status: containerInfo.Status,
              stats:
                {
                  memoryUsage: `${memoryUsage.toFixed(2)} MB`,
                  memoryLimit: `${memoryLimit.toFixed(2)} MB`,
                  diskUsage: `${diskUsageGB.toFixed(2)} GB`
              }
              
          };
      }));

      return containerHealth;
  } catch (error) {
      console.error('Error:', error);
      throw error;
  }
}

// Function to check system health
async function checkSystemHealth(req, res) {
  try {
    const diskUsage = await checkDiskUsage();
    // const docker_health = await getContainerHealth(); 

    // Get RAM usage
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    // Get CPU usage
    const cpuUsage = calculateCPUUsage();
    const idleDifference = cpuUsage.idle - prevCPUUsage.idle;
    const totalDifference = cpuUsage.total - prevCPUUsage.total;
    const percentageCPUUsage = 100 - Math.floor(100 * idleDifference / totalDifference);
    const systemHealth = {
      totalMemory: `${(totalMemory / (1024 ** 3)).toFixed(2)} GB`,
      usedMemory: `${(usedMemory / (1024 ** 3)).toFixed(2)} GB`,
      freeMemory: `${(freeMemory / (1024 ** 3)).toFixed(2)} GB`,
      freeDisk: `${(diskUsage.totalFree / (1024 ** 3)).toFixed(2)} GB`,
      usedDisk: `${(diskUsage.totalUsed / (1024 ** 3)).toFixed(2)} GB`,
      totalDisk: `${(diskUsage.totalAvailable / (1024 ** 3)).toFixed(2)} GB`,
      cpuUsage: `${percentageCPUUsage.toFixed(2)}%`, // CPU usage percentage
    //   dockerHealth: docker_health // Add Docker container health information
    };

    console.log(systemHealth);
    res.status(200).json(systemHealth);
  } catch (error) {
    console.error('Error while checking system health:', error);
    res.status(500).json({ error: 'Error checking system health' });
  }
}

app.get('/system-health', async (req, res) => {
  try {
    await checkSystemHealth(req, res);
  } catch (error) {
    console.error('Error in system health check route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// -----------------------------------------------------------------

app.listen(PORT, HOST, () => {
    console.log(`Runing on ${HOST}:${PORT}`);
    //Add Agent Up Webhook Call to Command Center
});
// https://assetstore.unity.com/packages/3d/environments/landscapes/vista-stylized-backgrounds-151622


// const horizonY = canvas.height * (2 / 3);

// // Function to draw the gradient sky
// function drawSky() {
//   const skyGradient = ctx.createLinearGradient(0, 0, 0, horizonY);
//   skyGradient.addColorStop(0, '#87CEEB');  // Light blue at the top
//   skyGradient.addColorStop(1, '#FFFFFF');  // White near the horizon

//   ctx.fillStyle = skyGradient;
//   ctx.fillRect(0, 0, canvas.width, horizonY);
// }

// // Function to draw the glowing sun
// function drawSun() {
//   const sunX = canvas.width * 0.75;  // Position sun 3/4th width of the canvas
//   const sunY = horizonY - 50;        // Slightly above the horizon
//   const sunRadius = 100;             // Radius of the sun

//   // Create a radial gradient for the sun glow
//   const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 5);
//   sunGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');   // Bright white at the sun's center
//   sunGradient.addColorStop(0.2, 'rgba(255, 223, 99, 0.8)'); // Yellow glow
//   sunGradient.addColorStop(0.4, 'rgba(255, 165, 0, 0.6)');  // Fainter orange
//   sunGradient.addColorStop(0.6, 'rgba(255, 69, 0, 0.3)');   // Light red hue
//   sunGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');        // Transparent outer glow

//   // Draw the radial gradient
//   ctx.fillStyle = sunGradient;
//   ctx.beginPath();
//   ctx.arc(sunX, sunY, sunRadius * 5, 0, Math.PI * 2, true);
//   ctx.closePath();
//   ctx.fill();
// }

// // Draw the entire background
// function drawBackground() {
//   drawSky();   // Draw the sky gradient
//   drawSun();   // Draw the glowing sun
// }

// // Initial drawing
// drawBackground();



//   // Function to draw the sky
//   function drawSky() {
//     const skyGradient = ctx.createLinearGradient(0, 0, 0, horizonY);
//     skyGradient.addColorStop(0, '#87CEEB'); // Light blue at the top
//     skyGradient.addColorStop(1, '#FFFFFF'); // White at the horizon

//     ctx.fillStyle = skyGradient;
//     ctx.fillRect(0, 0, canvas.width, horizonY);
//   }

//   // Function to draw mountains with lighting on one side
//   function drawMountain(x, baseY, peakHeight, peakOffset) {
//     // Peak position
//     const peakX = x + peakOffset;
//     const peakY = baseY - peakHeight;
    
//     // Light side gradient (right side)
//     const lightGradient = ctx.createLinearGradient(peakX, peakY, x + peakOffset * 2, baseY);
//     lightGradient.addColorStop(0, '#C0C0C0'); // Light gray for the lit side
//     lightGradient.addColorStop(1, '#8B8B8B'); // Darker gray for base of the lit side

//     // Shadow side gradient (left side)
//     const shadowGradient = ctx.createLinearGradient(x, peakY, peakX, baseY);
//     shadowGradient.addColorStop(0, '#4B4B4B'); // Dark gray for shadow side
//     shadowGradient.addColorStop(1, '#696969'); // Lighter at the base of shadow side

//     // Draw the shadow side (left side of mountain)
//     ctx.beginPath();
//     ctx.moveTo(x, baseY);
//     ctx.lineTo(peakX, peakY);
//     ctx.lineTo(x + peakOffset, baseY);
//     ctx.closePath();
//     ctx.fillStyle = shadowGradient;
//     ctx.fill();

//     // Draw the light side (right side of mountain)
//     ctx.beginPath();
//     ctx.moveTo(peakX, peakY);
//     ctx.lineTo(x + peakOffset * 2, baseY);
//     ctx.lineTo(x + peakOffset, baseY);
//     ctx.closePath();
//     ctx.fillStyle = lightGradient;
//     ctx.fill();
//   }

//   // Function to draw the entire mountain range
//   function drawMountains() {
//     drawMountain(100, horizonY, 200, 100);  // First mountain (left)
//     drawMountain(300, horizonY, 300, 150);  // Second mountain (center)
//     drawMountain(600, horizonY, 250, 120);  // Third mountain (right)
//   }

//   // Draw the entire background scene
//   function drawBackground() {
//     drawSky();        // Draw sky first
//     drawMountains();  // Then draw mountains with lighting effects
//   }

//   // Initial drawing
//   drawBackground();








// // For parallax, you would animate multiple hill layers moving at different speeds
// ctx.fillStyle = '#228B22'; // Foreground hill
// ctx.beginPath();
// ctx.moveTo(0, horizonY);
// ctx.quadraticCurveTo(canvas.width * 0.3, horizonY - 100, canvas.width, horizonY);
// ctx.lineTo(canvas.width, canvas.height);
// ctx.lineTo(0, canvas.height);
// ctx.closePath();
// ctx.fill();


// // Draw stars
// for (let i = 0; i < 100; i++) {
//     const x = Math.random() * canvas.width;
//     const y = Math.random() * canvas.height * 0.66;
//     ctx.fillStyle = '#FFFFFF';
//     ctx.fillRect(x, y, 2, 2); // Tiny star
//   }
//   // Draw planets
//   ctx.fillStyle = '#FF4500'; // Orange planet
//   ctx.beginPath();
//   ctx.arc(150, 100, 50, 0, Math.PI * 2, true); // Draw planet
//   ctx.fill();


// // Draw sand dunes
// ctx.fillStyle = '#F4A460'; // Sand color
// ctx.beginPath();
// ctx.moveTo(0, horizonY);
// ctx.quadraticCurveTo(canvas.width * 0.2, horizonY - 50, canvas.width * 0.4, horizonY);
// ctx.quadraticCurveTo(canvas.width * 0.6, horizonY + 50, canvas.width * 0.8, horizonY);
// ctx.lineTo(canvas.width, canvas.height);
// ctx.lineTo(0, canvas.height);
// ctx.closePath();
// ctx.fill();


// // Draw ocean waves with curves
// ctx.fillStyle = '#1E90FF'; // Water color
// ctx.beginPath();
// ctx.moveTo(0, horizonY);
// for (let i = 0; i < canvas.width; i += 50) {
//   ctx.quadraticCurveTo(i + 25, horizonY - 10, i + 50, horizonY);
// }
// ctx.lineTo(canvas.width, canvas.height);
// ctx.lineTo(0, canvas.height);
// ctx.closePath();
// ctx.fill();


// // Draw buildings in the skyline
// for (let i = 0; i < 15; i++) {
//     const buildingX = Math.random() * canvas.width;
//     const buildingHeight = Math.random() * 200 + 100;
//     const buildingWidth = Math.random() * 50 + 30;
//     ctx.fillStyle = '#708090'; // Building color
//     ctx.fillRect(buildingX, horizonY - buildingHeight, buildingWidth, buildingHeight); // Building shape
  
//     // Draw windows
//     for (let j = 0; j < buildingHeight / 30; j++) {
//       ctx.fillStyle = '#FFD700'; // Yellow for windows
//       ctx.fillRect(buildingX + 10, horizonY - buildingHeight + j * 30, 10, 10);
//     }
//   }

// // trees
// for (let i = 0; i < 10; i++) {
//     const x = Math.random() * canvas.width;
//     const treeHeight = Math.random() * 200 + 100;
//     ctx.fillStyle = '#8B4513'; // Tree trunk
//     ctx.fillRect(x, horizonY - treeHeight, 10, treeHeight); // Trunk
//     ctx.fillStyle = '#228B22'; // Tree leaves (triangle)
//     ctx.beginPath();
//     ctx.moveTo(x - 20, horizonY - treeHeight); // Triangle for leaves
//     ctx.lineTo(x + 30, horizonY - treeHeight);
//     ctx.lineTo(x + 5, horizonY - treeHeight - 60);
//     ctx.closePath();
//     ctx.fill();
//   }

// // Sunset sky gradient
// const sunsetGradient = ctx.createLinearGradient(0, 0, 0, horizonY);
// sunsetGradient.addColorStop(0, '#FF4500');  // Deep orange at the top
// sunsetGradient.addColorStop(1, '#FFD700');  // Golden yellow at the horizon
// ctx.fillStyle = sunsetGradient;
// ctx.fillRect(0, 0, canvas.width, horizonY);

// ----------------------------------
//  // Define the horizon position (2/3 down the canvas)
//  const horizonY = canvas.height * (2 / 3);

//  // Function to draw the sky with a gradient
//  function drawSky() {
//    const skyGradient = ctx.createLinearGradient(0, 0, 0, horizonY);
//    skyGradient.addColorStop(0, '#0f62fe'); // Deep blue at the top
//    skyGradient.addColorStop(0.7, '#87CEEB'); // Light blue near the horizon
//    skyGradient.addColorStop(1, '#FFFFFF'); // White at the horizon

//    // Fill the sky
//    ctx.fillStyle = skyGradient;
//    ctx.fillRect(0, 0, canvas.width, horizonY);
//  }

//  // Function to draw mountains with gradient shading
//  function drawMountains() {
//    // Create a gradient for distant mountains (light to dark for depth)
//    const mountainGradient1 = ctx.createLinearGradient(0, horizonY - 150, 0, canvas.height);
//    mountainGradient1.addColorStop(0, '#A9A9A9'); // Light gray at the top of the mountain
//    mountainGradient1.addColorStop(1, '#696969'); // Darker gray towards the base

//    // Draw the first (distant) mountain range with gradient
//    ctx.beginPath();
//    ctx.moveTo(0, horizonY);
//    ctx.lineTo(canvas.width * 0.15, horizonY - 100);
//    ctx.lineTo(canvas.width * 0.3, horizonY);
//    ctx.lineTo(canvas.width * 0.5, horizonY - 150);
//    ctx.lineTo(canvas.width * 0.7, horizonY);
//    ctx.lineTo(canvas.width * 0.85, horizonY - 100);
//    ctx.lineTo(canvas.width, horizonY);
//    ctx.lineTo(canvas.width, canvas.height);
//    ctx.lineTo(0, canvas.height);
//    ctx.closePath();
//    ctx.fillStyle = mountainGradient1;
//    ctx.fill();

//    // Create a gradient for closer mountains (darker with more detail)
//    const mountainGradient2 = ctx.createLinearGradient(0, horizonY - 100, 0, canvas.height);
//    mountainGradient2.addColorStop(0, '#556B2F'); // Dark olive green at the peak
//    mountainGradient2.addColorStop(1, '#2F4F4F'); // Dark slate gray at the base

//    // Draw the second (closer) mountain range with gradient
//    ctx.beginPath();
//    ctx.moveTo(0, horizonY + 50);
//    ctx.lineTo(canvas.width * 0.2, horizonY - 50);
//    ctx.lineTo(canvas.width * 0.4, horizonY + 30);
//    ctx.lineTo(canvas.width * 0.6, horizonY - 70);
//    ctx.lineTo(canvas.width * 0.8, horizonY);
//    ctx.lineTo(canvas.width, horizonY + 50);
//    ctx.lineTo(canvas.width, canvas.height);
//    ctx.lineTo(0, canvas.height);
//    ctx.closePath();
//    ctx.fillStyle = mountainGradient2;
//    ctx.fill();
//  }

//  // Function to draw the entire background (sky + mountains)
//  function drawBackground() {
//    drawSky();        // Draw the sky first
//    drawMountains();  // Then draw the mountain range
//  }

//  // Initial draw
//  drawBackground();            

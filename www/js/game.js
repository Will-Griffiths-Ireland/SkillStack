let itemsApp = ""

let mouse_x = 1;
let mouse_y = 1;

function loadAssess() {
    itemsApp = LearnosityItems.init(request, {
        readyListener() {
            console.log('ready');
            document.querySelector('.animated-box').classList.add('expand');

            // Since we will only have mcq then as soonas the user selects a response we will trigger validation
            // and display an animation based on response correctness. We then move to next item or submit
            itemsApp.on('item:attemptedstatus:change', function (e) {
                const box = document.querySelector('.animated-box');

                let animation_type = "";

                if(itemsApp.question(itemsApp.getCurrentItem().questions[0].response_id).isValid())
                {
                    console.log("Correct!!!");
                    createParticles(mouse_x, mouse_y);
                    animation_type ="spin-disappear"
                }
                else{
                    console.log("Incorrect");
                    animation_type ="spin-disappear"
                }
            
                // Remove expand if it's there
                box.classList.remove('expand');
            
                // Add flash-green
                box.classList.add(animation_type);
            
                // Wait for the flash animation to finish before proceeding
                setTimeout(() => {
                    box.classList.remove(animation_type);
            
                    const itemDetail = itemsApp.getCurrentItem();
                    console.log(itemDetail.is_last_item);
            
                    if (!itemDetail.is_last_item) {
                        itemsApp.items().next();
            
                        // Re-add expand after transition to next item
                        setTimeout(() => {
                            box.classList.add('expand');
                        }, 100); // small delay to avoid stacking animations
                    } else {
                        console.log("We are on the final item and will submit");
                        //fireworks baby!!
                        for (let i = 0; i < 100; i++) {
                            setTimeout(() => {
                              const mouse_x = Math.random() * window.innerWidth;
                              const mouse_y = Math.random() * window.innerHeight;
                              createParticles(mouse_x, mouse_y);
                            }, i * 50); // 50ms delay between each burst
                          }
                    }
            
                }, 1000); // delay to match animation duration of .flash-green
            });
            itemsApp.on('item:load', function (e) {
                document.querySelector('.animated-box').classList.add('expand');
            });
        },
        errorListener(err) {
            console.log('error', err);
        }
    })

}

//test emitter click

const canvas = document.getElementById('burstCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

function createParticles(x, y) {
  const colors = ['#FFFF00', '#FF0000', '#0000FF'];
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: x,
      y: y,
      radius: Math.random() * 8 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      velocityX: (Math.random() - 0.5) * 4,
      velocityY: (Math.random() - 0.5) * 4,
      alpha: 1
    });
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p, index) => {
    p.x += p.velocityX;
    p.y += p.velocityY;
    p.alpha -= 0.01;
    if (p.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 6);
      ctx.fillStyle = p.color;
      ctx.fill();
    }
  });
  ctx.globalAlpha = 1;
  requestAnimationFrame(animate);
}

document.addEventListener('click', (e) => {
    mouse_x = e.clientX;
    mouse_y = e.clientY;
});

animate();
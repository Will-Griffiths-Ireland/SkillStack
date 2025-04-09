const uuid = require('uuid');  // Load the UUID library

const learnositySdk = new Learnosity(); // Instantiate the SDK
const request = learnositySdk.init(  // Set Learnosity init options
    'items',                              // Select Items API
    {
        consumer_key: process.env.CONSUMER_KEY,
        domain: 'skillstack-81wm.onrender.com',
    },
    process.env.CONSUMER_SECRET,
    {
        user_id: uuid.v4(),
        activity_template_id: 'quickstart_examples_activity_template_001',
        session_id: uuid.v4(),
        activity_id: "quickstart_examples_activity_001",
        rendering_type: 'assess',
        type: 'submit_practice',
        name: "Items API Quickstart",
        state: 'initial',
        config: {
            regions: 'main'
        }
    })

    const itemsApp = LearnosityItems.init(request, {
        readyListener() {
            console.log('ready');
        },
        errorListener(err) {
            console.log('error', err);
        }
    })
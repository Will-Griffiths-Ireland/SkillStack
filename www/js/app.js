import Learnosity from '../../../index';

function generateUUID() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4))).toString(16)
    );
  }

const learnositySdk = new Learnosity(); // Instantiate the SDK
const request = learnositySdk.init(  // Set Learnosity init options
    'items',                              // Select Items API
    {
        consumer_key: process.env.CONSUMER_KEY,
        domain: 'skillstack-81wm.onrender.com',
    },
    process.env.CONSUMER_SECRET,
    {
        user_id: generateUUID(),
        activity_template_id: 'quickstart_examples_activity_template_001',
        session_id: generateUUID(),
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
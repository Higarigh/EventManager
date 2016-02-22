/**
 * Server configuration
 */
var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');

var allowCrossDomain = function(request, response, next) {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    response.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
};


/**
 * Event storage
 */
var eventId = 0;
var events = [];

function createEvent(id, name, description, targetGroup, location, times){
    if(name) {
        var event = {
            id: (id) ? id : ++eventId,
            name : name,
            description : description,
            targetGroup: targetGroup,
            location:location,
            times : times,
        };
        events.push(event);
        return event;
    } else {
        return null;
    }
}

function findEvent(id) {
    return events.filter(function(event) {
        return event.id == id
    })[0];
}

function deleteEvent(id) {
    var eventIndex = events.indexOf(findEvent(id));
    if(eventIndex > -1) {
        return events.splice(eventIndex, 1)[0];
    }
}

/**
 * Dummy data
 */
var event1 = createEvent(
    null,
    "HSR-Party",
    "Party an der HSR",
    "Studenten",
    {
        name: "HSR",
        street: "Oberseestrasse",
        plz: 8640,
        city: "Rapperswil"
    },
    {
        begin: new Date('2015-11-15T19:00:00'),
        end: new Date('2011-11-16T03:00:00')
    }
);

var event2 = createEvent(
    null,
    "Dinner",
    "Mitarbeiterdinner der HSR",
    "HSR Mitarbeiter",
    {
        name: "HSR",
        street: "Oberseestrasse",
        plz: 8640,
        city: "Rapperswil"
    },
    {
        begin: new Date('2015-11-20T18:00:00'),
        end: new Date('2011-11-20T21:00:00')
    }
);

/**
 * Basic server
 */
var app = express();
app.use(allowCrossDomain);
app.use(bodyParser.json())
/**
app.use('/api', express.static(__dirname + '/api'));
app.use('/', express.static(__dirname + '/webapp/source'));
// tests, remove this for production
app.use('/tests', express.static(__dirname + '/webapp/tests'));
app.use('/source', express.static(__dirname + '/webapp/source'));


 *
 * API routes
 */
app.get('/api/events', function(request, response) {
    response.json({ events: events });
});

app.post('/api/events', function(request, response) {
    var event = createEvent(
       request.body.id,
       request.body.name,
       request.body.description,
       request.body.targetGroup,
       request.body.location,
       request.body.times
   );
   if(event) {
       response.json(event);
   } else {
       response.status(400).send('Event data incomplete.');
   }
});

app.get('/api/events/:id', function(request, response) {
    var event = findEvent(request.params.id);
    if (event) {
        response.json(event);
    } else {
        response.status(404).send('Event (id '+request.params.id+') not found.')
    }
});

app.post('/api/events/:id', function(request, response) {
	var event = findEvent(request.params.id);
	if (event) {
		if(request.body.name && request.body.name != event.name) {
			event.name = request.body.name;
		}
		if(request.body.description && request.body.description != event.description) {
			event.description = request.body.description;
		}
		if(request.body.targetGroup && event.targetGroup != request.body.targetGroup) {
			event.targetGroup = request.body.targetGroup;
		}
		if(request.body.location && event.location != request.body.location) {
			event.location = request.body.location;
		}
		if(request.body.times && event.times != request.body.times) {
			event.times = request.body.times;
		}
    response.json(event);
	} else {
		response.status(404).send('Event (id '+request.params.id+') not found.')
	}
});

app.delete('/api/events/:id', function(request, response) {
    var event = findEvent(request.params.id);
    if (event) {
        response.json(event);
        deleteEvent(event.id);
    } else {
        response.status(404).send('Event (id '+request.params.id+') not found.')
    }
});


/**
 * Server start
 */
 var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
 var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
 var server = http.createServer(app);

 server.listen(server_port, server_ip_address, function(){
   console.log("Listening on " + server_ip_address + ", server_port " + server_port)
 });

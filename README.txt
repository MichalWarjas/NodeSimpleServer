Simple Node.js web server

to start:
node server.js [PARAMETERS]

PARAMETERS:
cache=false - use to disable cache
destination=<destinationPathName>=<destinationURL> - to use as a proxy

destinationPathName - path name in the url to put after 'destinations' path
http://localhost:9999/destinations/<destinationPathName>/rest/of/theURL

Example
node server.js cache=false destination=myurl=michalwarjas.pl

then call
http://localhost:9999/destinations/myurl/ODataService.svc/$metadata

it redirects to

https://www.michalwarjas.pl/ODataService.svc/$metadata

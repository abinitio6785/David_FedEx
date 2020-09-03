var fedexAPI = require('fedex');
var util = require('util');
const http = require("http");
const fs = require("fs");
const qs = require("querystring");
const requst = require('request');


const port = process.env.PORT || 3000;


http.createServer(function (request, server_response) {
   if (request.method === "POST") {
	   
	var fedex = new fedexAPI({
		environment: 'sandbox', // or live
		debug: true,
		key: 'oltJtf4aUdqIf2Gz',
		password: 'x&]sbzf&zT7452',
		account_number: '510087500',
		meter_number: '114098114',
		imperial: true // set to false for metric
	});

   		var body = '';

        request.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                request.connection.destroy();
        });

        request.on('end', function () {
            var post = qs.parse(body);

            fedex.rates({
			  ReturnTransitAndCommit: true,
			  CarrierCodes: ['FDXE','FDXG'],
			  RequestedShipment: {
				DropoffType: 'REGULAR_PICKUP',
				//ServiceType: 'FEDEX_GROUND',
				//PackagingType: 'YOUR_PACKAGING',
				Shipper: {
				  Contact: {
					PersonName: 'Sender Name',
					CompanyName: 'Company Name',
					PhoneNumber: '5555555555'
				  },
				  Address: {
					StreetLines: [
					  post.from_street
					],
					City: post.from_city,
					StateOrProvinceCode: post.from_state,
					PostalCode: post.from_zip,
					CountryCode: 'US'
				  }
				},
				Recipient: {
				  Contact: {
					PersonName: 'Kaanapali',
					CompanyName: 'Company Receipt Name',
					PhoneNumber: '5555555555'
				  },
				  Address: {
					StreetLines: [
					  post.to_street
					],
					City: post.to_city,
					StateOrProvinceCode: post.to_state,
					PostalCode: post.to_zip,
					CountryCode: 'US',
					Residential: false
				  }
				},
				ShippingChargesPayment: {
				  PaymentType: 'SENDER',
				  Payor: {
					ResponsibleParty: {
					  AccountNumber: fedex.options.account_number
					}
				  }
				},
				PackageCount: '1',
				RequestedPackageLineItems: {
				  SequenceNumber: 1,
				  GroupPackageCount: 1,
				  Weight: {
					Units: 'LB',
					//Units: 'pound',
					Value: post.weight
				  }/*,
				  Dimensions: {
					Length: 108,
					Width: 5,
					Height: 5,
					Units: 'IN'
				  }*/
				}
			  }
			}, function(err, res) {
			  if(err) {
				return console.log('err = ', err);
			  }

				let finalOut = res.RateReplyDetails;

				for(let i = 0; i < finalOut.length; i++){
					server_response.write("\n-----------------------------------");
					server_response.write("\n ServiceType: "+finalOut[i].ServiceType);
					server_response.write("\n Amount: "+finalOut[i].RatedShipmentDetails[0].ShipmentRateDetail.TotalNetCharge.Amount);

			   }
			   server_response.end();

			});
        });

   }else{
		fs.readFile("register.html",function(err,data){
			server_response.writeHead(200,{'content-type':"text/html"});
			server_response.write("\n"+ data);
			server_response.end();
		});
	}
}).listen(port);


// Console will print the message
console.log('Server running at http://127.0.0.1:'+port+'/');






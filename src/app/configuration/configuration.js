var configuration = {
	apiUrl:'http://oohlala.com.uy',
	uploadUri:'/fileshandler/upload.php',
	cartImagesUrl:'http://api.columnis.com/uploads/035/images/thumbs',
	cartOrderUrl:'http://api.columnis.com/035/ecommerce/orders',
	paymentGatewayUrl: 'http://api.columnis.com/035/ecommerce/getPaymentUrl',
	paymentMethods:[
		{'id':1, 'method':'visa', 'class':'visa'},
		{'id':2, 'method':'oca', 'class':'oca'},
		{'id':3, 'method':'master', 'class': 'master'},
		{'id':4, 'method':'diners', 'class':'diners'},
		{'id':5, 'method':'lider', 'class':'lider'},
		{'id':6, 'method':'abitab', 'class':'abitab'},
		{'id':7, 'method':'redpagos', 'class':'redpagos'}
	],
	orderLS: 'order',
	quantityLS: 'quantity',
	stockInProduct:true,
	mainPage:'/',
	confirmationOkTitle:'Compra realizada!',
	confirmationFailTitle:'Ocurrió un error...',
	confirmationOkMessage:'Este es el mensaje de que salió todo bien',
	confirmationFailMessage:'Te pedimos disculpas, ocurrió algo inesperado que no nos permitió continuar con el proceso. Por favor ponete en contacto con nosotros y te daremos una solución. Tu número de orden es: ',
	confirmationFailMessageClose:'. Gracias por comprender.',
	proportionAccuracy: 0.05
};


//NEEDS TO BE DELETED WHEN RUNNING FROM THE SERVER
/*
var Order={
	'paid':true,
	'id':80,
	'_embedded':{
		'items':[
			{
				'id':34,
				'price':200,
				'productInformation':'producto 1, proporcion .67',
				'quantity':1,
				'_embedded':{
					'product':{
						'id':34,
					},
					'productVersion':{
						'id':34
					}
				}
			},{
				'id':36,
				'price':200,
				'productInformation':'Producto 2, proporcion 1',
				'quantity':1,
				'_embedded':{
					'product':{
						'id':36,
					},
					'productVersion':{
						'id':36
					}
				}
			},{
				'id':40,
				'price':200,
				'productInformation':'producto 3, proporcion .67',
				'quantity':1,
				'_embedded':{
					'product':{
						'id':40,
					},
					'productVersion':{
						'id':40
					}
				}
			},{
				'id':48,
				'price':200,
				'productInformation':'producto 4, proporcion .72',
				'quantity':1,
				'_embedded':{
					'product':{
						'id':48,
					},
					'productVersion':{
						'id':48
					}
				}
			},{
				'id':69,
				'price':200,
				'productInformation':'producto 5, propocion -1',
				'quantity':1,
				'_embedded':{
					'product':{
						'id':69,
					},
					'productVersion':{
						'id':69
					}
				}
			},{
				'id':70,
				'price':200,
				'productInformation':'producto 6, proporcion .72',
				'quantity':1,
				'_embedded':{
					'product':{
						'id':70,
					},
					'productVersion':{
						'id':70
					}
				}
			}
		]
	},
	'extraData':[{
		"shipping":"-1",
		"quantity":{"34":2,"36":2,"40":3,"48":4,"69":4,"70":4},
		"proportions":{"34":0.67,"36":1,"40":0.67,"48":0.72,"69":-1,"70":0.72}
	}]
};


Order={
	'paid':true,
	'id':80,
	'_embedded':{
		'items':[
			{
				'id':34,
				'price':200,
				'productInformation':'producto 1, proporcion .67',
				'quantity':1,
				'_embedded':{
					'product':{
						'id':34,
					},
					'productVersion':{
						'id':34
					}
				}
			}
		]
	},
	'extraData':[{
		"shipping":"-1",
		"quantity":{"34":1},
		"proportions":{"34":-1}
	}]
};



// */

//NEEDS TO BE DELETED WHEN RUNNING FROM THE SERVER

/*
var Shipping = {
"_embedded":
{
"products":[
{
"id":7,
"title":"Envío a domicilio",
"price":100
}
]
}
}


var ShippingType = {
"_embedded":{
"products":[
{
"id":36,
"title":"Express",
"detail":null,
"keywords":null,
"description":"",
"type":1,
"date_hour":null,
"stock":null,
"rating":null,
"price":200,
"shipping":null,
"highlight":null,
"new":null,
"picture":null,
"album":null,
"brand":null,
"translations":[],
"filename":null,
"branchStores":[],
"store_id":[],
"features":[],
"idiomas":null,
"slug":"express",
"idParam":"pid=36",
"albumComplete":null,
"_embedded":
{
"categories":[
{
"id":11,
"name":
"Tipo de Envío",
"description":null,
"order":"9",
"picture":null,
"parent":null,
"subCategories":[],
"slug":"tipo-de-envio",
"idParam":"cid=11",
"hasFragment":true
}
],
"productVersions":[]
},
"_embeddedPager":{
"categories":{
"page_count":1,
"page_size":1,
"total_items":1,
"page":1
},
"productVersions":{
"page_count":1,
"page_size":0,
"total_items":0,
"page":1
}
}
}
]
}
}







// */

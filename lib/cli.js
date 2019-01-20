/*
*
All CommandLine Interface related tasks
*
*/


//Dependencies
var readline = require('readline');
var events = require('events');
var _data = require('./data');
var util = require('util');

class _events extends events{};
var e = new _events();




//Module container
var cli = {};

//container of the responders 
cli.responders = {};

/*****Event Subscriptions ****/


//subscribing to the help event 
e.on('help',str => {
	cli.responders.help(str);
});
//subscribing to the exit event 
e.on('exit',str => {
	cli.responders.exit(str);
});
//subscribing to the 'more user info' event 
e.on('more user info',str => {
	cli.responders.moreUserInfo(str);
});
//subscribing to the 'list users' event 
e.on('new users',str => {
	cli.responders.NewUsers(str);
});

// subscribing to the 'today orders event'
e.on('today orders',str => {
	cli.responders.todayOrders(str);
});

//Subscribing to the 'more order info' event
e.on('more order info',str => {
	cli.responders.moreOrderInfo(str);
});
//Subscribing to 'menu items' event
e.on('menu items',str => {
	cli.responders.menuItems(str);
});

/****** Responders to respective events ********/

//help responder function
cli.responders.help = str => {
	//list of all commands
	var commands = {
		'help':'Accessing this page',
		'exit': 'for Killing the server and all background processes',
		'new users':'Listing users who joined within 24hours',
		'more user info --{userEmail}':'More details of a specific user, spacifying the user by email',
		'menu items':'Listing all menu items available',
		'today orders':'List of All new orders made within 24 hours',
		'more order detail --{orderID}':'More details about a specific order filtering by orderID'
	
	}
	
	cli.displayInfo('CLI USER GUIDE',commands);
	
	};
//more user info responder function
cli.responders.moreUserInfo = str => {
	var userEmail = str.split('--')[1];
	//reading the matcherFile to get userId using the email
	_data.read('matcher','matcher',(err,matcherObject) => {
		if(!err && matcherObject){
			var userId = matcherObject[userEmail];
			//reading the user from FS 
			_data.read('users',userId,(err,userData) => {
				if(!err && userData){
					delete userData.hashedPassword;
					cli.displayInfo(`User: ${userData.userId}`,userData);
					
					
				}else{
					console.log('User not found');
				}
			});
		}
	});
};
//exit responder function
cli.responders.exit = str => {
	process.exit(0);
};
//list users responder function
cli.responders.NewUsers = str => {
	//reading the users collection
	_data.list('users',(err,usersList)=>{
		if(!err && usersList){
			//subtracting 24hours from the current time
			var joinedAtLimit = Date.now() - (24 * 60 * 60 * 1000 );
			var usersCollection = {};
			//build the data object to be displayed
			for(var i=0; i<usersList.length; i++){
				var user = usersList[i];
				if(user.joinedAt > joinedAtLimit){
				usersCollection[user.firstName+'  '+user.firstName] = user.email
				}
			}
			cli.displayInfo('New users collection',usersCollection);
					
		}
	});
};

//Responding to the today orders event
cli.responders.todayOrders = str => {
	str = typeof str =='string' && str.length >0 ?str :'';
	//reading the orders 
	_data.list('orders',(err,ordersList)=>{
		if(!err && ordersList){
			//subtracting 24hours from the current time
			var placedAtLimit = Date.now() - (24 * 60 * 60 * 1000 );
			var ordersCollection = {};
			//build the data object to be displayed
			for(var i=0; i<ordersList.length; i++){
				var order = ordersList[i];
				if(order.placedAt > placedAtLimit && order.status =='placed'){
				ordersCollection[order.id] = order.streetAddress
				}
			}
			cli.displayInfo('Today\'s orders collection',ordersCollection);
					
		}
	});
};

cli.responders.moreOrderInfo = str => {
	str = typeof str =='string' && str.length >0 ?str :false;
	if(str){
		var orderId = str.split('--')[1];
		//Reading the  order
		_data.read('orders',orderId,(err,orderData) => {
			if(!err && orderData){
				delete orderData.id;
				var items = orderData.items;
				delete orderData.items;
				cli.displayInfo(`Order: ${orderId}`,orderData,true);
				items.forEach(item => {
				cli.displayInfo(`item: ${item.title}`,item,true);
				})
			}
		})
	}
	
};

//Responding to the menu items event
cli.responders.menuItems = str => {
	str = typeof str =='string' && str.length >0 ?str :'';
	//reading the meals 
	_data.list('meals',(err,mealsList)=>{
		if(!err && mealsList){
			var mealsCollection = {};
			//build the data object to be displayed
			for(var i=0; i<mealsList.length; i++){
				var meal = mealsList[i];
				mealsCollection[meal.title] = '$'+meal.price
			}
			cli.displayInfo('Menu items collection',mealsCollection);
					
		}
	});

};




/********** CONSOLE DISPLAY FORMATTING UTITLIES *****/


//Imnfor block constructor
cli.displayInfo = (heading,data,endLine) => {
	heading  = typeof heading =='string' && heading.length >0 ?heading :'';
	data = typeof data =='object' && data !== null ? data :false;
	if(data){
			cli.horizontalLine();
	    cli.textCenter(heading);
			cli.horizontalLine();
	
	for(var key in data){
     if(data.hasOwnProperty(key)){
        var value = data[key];
        var line = '      \x1b[35m '+key+'      \x1b[0m';
        var padding = 60 - line.length;
        for (i = 0; i < padding; i++) {
            line+=' ';
        }
        line+=value;
        console.log(line);
        cli.lineBreak();
     }
  }
  cli.lineBreak();

  // End with  horizontal line
  if(!endLine || typeof endLine == 'undefined'){
  cli.horizontalLine();
	}


	} 
}



//Drawing a horizontal line
cli.horizontalLine = () => {
	var screenWidth = process.stdout.columns;
	var line = '';
	for(var i=0;i<screenWidth;i++){
		line+='*';
	}
	console.log(line);
};

//centering text
cli.textCenter = (str) => {
	str = typeof (str) == 'string' && str.trim().length >0 ? str :false;
	
	if(str){
		var width = process.stdout.columns
		var line ='';
		var leftPadding = Math.floor((width - str.length)/2);
		for(var i=0; i<leftPadding ; i++ ){
			line+=' ';
		}
		line+=str;
		console.log('\x1b[35m'+line+'\x1b[0m');
	}
};

//Line breaks
cli.lineBreak = (number) => {
	number = typeof (number) == 'number' && number > 0 ? number :1;
	for (var i=0;i<number;i++){
		console.log('');
	}
};



//User input processing
cli.inputProcessor = str => {
	//sanitizing and validating input
	str = typeof (str) == 'string' && str.length > 0 ? str :false;
	if(str){
		//listing the list of acceptable inputs 
		var acceptableInputs = [
			'help',
			'exit',
			'new users',
			'more user info',
			'today orders',
			'more order info',
			'menu items'
		]
		
		//checking if the usesr input matches any one of the acceptableInputs and then emit the event 
		var matchFound = false;
		//looping through the acceptableInputs until a match if found if there is any
	 for(var i=0;i<acceptableInputs.length;i++) {
			if(str.toLowerCase().indexOf(acceptableInputs[i]) > -1 ){
				matchFound = true;
				e.emit(acceptableInputs[i],str);
			}
		};
		//inform user that no match was found
		if(!matchFound){
			console.log('Sorry try again');
		}
		
	}
};







//Intitialisation function
cli.init = () => {
	
	console.log('\x1b[34m%s\x1b[0m','The CLI has started');
	// buildingg the ClI Interface 
	var cliInterface = readline.createInterface({
		'input':process.stdin,
		'output':process.stdout,
		'prompt':''
	});
	
	//starting the Interface 
	cliInterface.prompt();
	
	//reading and processing one line of entry 
	cliInterface.on('line',str=>{
		//if the input is empty.. do nothing
		if(str.length>0){
			cli.inputProcessor(str);
		}
	});
	//prompt the user again after the previous task is done.
	cliInterface.prompt();
	
	
};


//Exportation of the Module
module.exports = cli;
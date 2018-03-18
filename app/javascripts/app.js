import React from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3'
import contract from 'truffle-contract';

import AuctionContractCompiled from '../../build/contracts/Auction.json';
import AuctionerContractCompiled from '../../build/contracts/Auctioner.json';

import './../stylesheets/app.css';

var AuctionContract = contract(AuctionContractCompiled);
var AuctionerContract = contract(AuctionerContractCompiled);

var web3;
if (typeof web3 != 'undefined') {
	console.log("Using web3 detected from external source like Metamask")
    web3 = new Web3(web3.currentProvider)
} else {
	web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"))
}

var LocalWeb3Provider = web3.currentProvider;

AuctionerContract.setProvider(LocalWeb3Provider);
AuctionContract.setProvider(LocalWeb3Provider);

var DeployedAuctioner;

AuctionerContract
	.deployed({from: "0x627306090abaB3A6e1400e9345bC60c78a8BEf57"})
	.then(function(deploy) {
	DeployedAuctioner = deploy;
});

AuctionContract.defaults({ gas: 4712388, gasPrice: 1000000000 });

Storage.prototype.setObj = function(key, obj) {
    return this.setItem(key, JSON.stringify(obj))
}
Storage.prototype.getObj = function(key) {
    return JSON.parse(this.getItem(key))
}

if(localStorage.getItem('auctions').length === 0){
	localStorage.setObj('auctions', []);
}

class AuctionBoundry extends React.Component {

	constructor(props){
		super(props);
	}

	render() {
	  return (
		 <div className="col-6 col-sm-6 col-md-4 col-lg-3">
		  {this.props.children}
		 </div>
	  )
	}
  }

class AuctionForm extends React.Component {
    
    constructor(){
        super();
		this.auction = {};
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleURLChange = this.handleURLChange.bind(this);
		this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
		this.handleItemNameChange = this.handleItemNameChange.bind(this);
		this.handlePriceChange = this.handlePriceChange.bind(this);
		this.handleCommisionPlanChange = this.handleCommisionPlanChange.bind(this);
    }

    handleSubmit(event){

		event.preventDefault();
		if(this.auction.url &&
			this.auction.description.length > 0 &&
			this.auction.description.length <= 1024 &&
			this.auction.itemName &&
			this.auction.span &&
			this.auction.startPrice){


			AuctionContract.new(
				DeployedAuctioner.address,
				this.auction.itemName,
				this.auction.description,
				this.auction.url,
				this.auction.startPrice,
				this.auction.span
			,{
				value: this.auction.startPrice + 100,
				from: web3.eth.accounts[0]
			}
			).then( (instance) => {
				var div = document.createElement('div');
				div.className = "col-6 col-sm-6 col-md-4 col-lg-3";
				content.appendChild(div);
				var auctions = localStorage.getObj('auctions')
				auctions.push(instance.address);
				localStorage.setObj('auctions', auctions);
				ReactDOM.render(<AuctionItem contractInstance={instance}/>, div);
			})

		}

    }

    handleURLChange(event){
        let url = event.target.value;
        this.auction.url = url;
    }

    handleDescriptionChange(event){
        let description = event.target.value;
        this.auction.description = description;
    }

    handleItemNameChange(event){
        let itemName = event.target.value;
        this.auction.itemName = itemName;
    }

    handlePriceChange(event){
        let price = parseInt(event.target.value);
        if(price) {
            this.auction.startPrice = price;
        }
	}
	
	handleCommisionPlanChange(event){
		let comissionPlan = parseInt(event.target.value);
		if(comissionPlan){
			this.auction.span = comissionPlan;
		}
	}


    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                    <div className="form-group">
                         <label htmlFor="exampleInputEmail1">Item Name</label>
                            <input type="text" className="form-control" id="itemName" onChange={this.handleItemNameChange} aria-describedby="nameHelp" placeholder="Enter item name"/>
                            <small id="nameHelp" className="form-text text-muted">The name of the item (title)</small>
                    </div>
                        <div className="form-group">
                            <label htmlFor="thumbnailURL">Thumbnail URL</label>
                            <input type="text" className="form-control" id="thumbnailURL" onChange={this.handleURLChange} placeholder="URL"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="price">Starting Price [wei] (has to be bigger than 1000 szabo)</label>
                            <input type="number" className="form-control" id="price" onChange={this.handlePriceChange}/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">Description (1024 characters)</label>
                            <textarea className="form-control" id="description" rows="3" onChange={this.handleDescriptionChange}></textarea>
                        </div>
                        <fieldset className="form-group">
                            <legend>Timespan</legend>
                            <div className="form-check">
                                <label className="form-check-label">
                                    <input type="radio" className="form-check-input" name="optionsRadios" id="optionsRadios1" value="1" onChange={this.handleCommisionPlanChange} /> 24 Hours - Flat Rate (0.01 ether)
                                </label>
                            </div>
                            <div className="form-check">
                                <label className="form-check-label">
                                    <input type="radio" className="form-check-input" name="optionsRadios" id="optionsRadios2" value="3" onChange={this.handleCommisionPlanChange}/> 3 Days - 10% Sales Comission
                                </label>
                            </div>
                            <div className="form-check disabled">
                                <label className="form-check-label">
                                    <input type="radio" className="form-check-input" name="optionsRadios" id="optionsRadios3" value="7" onChange={this.handleCommisionPlanChange}/> 7 Days - 15% Sales Comission
                                </label>
                            </div>
                        </fieldset>
                        <div className="form-check">
                            <label className="form-check-label">
                                <input type="checkbox" className="form-check-input"/> I Agree that upon termination i will get charged a flat rate of 0.001 ether
                            </label>
                        </div>
                        <button type="submit" id="submitAuction" className="btn btn-primary">Submit</button>
            </form>
        )
    }
}


class WithdrawBidsForm extends React.Component {
	constructor(props){
		super(props);
	}

	render() {
		return (
			<form className="form-inline">
			<label className="sr-only" htmlFor="inlineFormInput">Address (Optional)</label>
  				<input type="text" className="form-control mb-2 mr-sm-2 mb-sm-0" id="inlineFormInput" placeholder="Ethereum Address (Optional)"/>

  				<label className="sr-only" htmlFor="inlineFormInputGroup">Secret</label>
  				<div className="input-group-prepend mb-2 mr-sm-2 mb-sm-0">
    				<span  className="input-group-text" id="basic-addon1">@</span>
    				<input type="text" className="form-control" id="inlineFormInputGroup" aria-describedby="basic-addon1" placeholder="Secret"/>
  				</div>

  				<button type="submit" className="btn btn-primary">Withdraw Bids</button>
			</form>
		)
	}
}

class WithdrawWinnerBid extends React.Component {

	constructor(pros){
		super(props);
	}

	render(){
		return (
			<form className="form-inline">
		<label className="sr-only" htmlFor="inlineFormInputGroup">Secret</label>
		<div className="input-group-prepend mb-2 mr-sm-2 mb-sm-0">
		  <span  className="input-group-text" id="basic-addon1">@</span>
		  <input type="text" className="form-control" id="inlineFormInputGroup" aria-describedby="basic-addon1" placeholder="Secret"/>
		</div>

		<button type="submit" className="btn btn-primary">Withdraw Winner's Bet</button>
		</form>
		)
	}
}


class Placeholder extends React.Component {

	constructor(props){
		super(props);
	}

	render() {
	  return (
		 <div className="container-fluid">
		  {this.props.children}
		 </div>
	  )
	}
  }


class DetailsModalForm extends React.Component {

	constructor(props){
		super(props);
	}

	render(){
		return (
			<Placeholder>
			<form className="form-inline">
  				<label className="sr-only" htmlFor="inlineFormInput">Address</label>
  				<input type="text" className="form-control mb-2 mr-sm-2 mb-sm-0" id="inlineFormInput" placeholder="Ethereum Address"/>

  				<label className="sr-only" htmlFor="inlineFormInputGroup">Secret</label>
  				<div className="input-group-prepend mb-2 mr-sm-2 mb-sm-0">
    				<span  className="input-group-text" id="basic-addon1">@</span>
    				<input type="text" className="form-control" id="inlineFormInputGroup" aria-describedby="basic-addon1" placeholder="Secret"/>
  				</div>

  				<div className="form-check mb-2 mr-sm-2 mb-sm-0">
    				<label className="form-check-label">
      					<input className="form-check-input" type="checkbox"/> I AGREE with the terms
    				</label>
  				</div>

  				<button type="submit" className="btn btn-primary">Authorize</button>
			</form>
			<WithdrawBidsForm />
			<WithdrawWinnerBid />
			</Placeholder>
		)
	}

}

class AuctionItem extends React.Component {

    constructor(props){
		super(props);
		if(!props.contractInstance){
			return;
		}

		this.state = {
			itemName: "",
			startPrice: -1,
			description: "",
			thumbnailURL: "",
			hours: 0,
			minutes: 0,
			seconds: 0
		}

		this.instance = props.contractInstance;
    }

	componentDidMount(){

		Promise.all([
			this.instance.getItemName.call(),
			this.instance.getPrice.call(),
			this.instance.getDescription.call(),
			this.instance.getThumbnailURL.call(),
			this.instance.getRemainingTime.call()
		]).then((response) => {
			let itemName = response[0];
			let startPrice = response[1];
			let description = response[2];
			let thumbnailURL = response[3];
			let totalSeconds = response[4];
			this.setState({
				itemName: itemName.length > 27 ? itemName.substring(0,25) + "..." : itemName,
				startPrice: parseFloat(web3.fromWei(startPrice.toNumber(), "ether" )).toFixed(3) + " ETH",
				description: description.length > 27 ? description.substring(0,25) + "..." : description,
				thumbnailURL: thumbnailURL,
				totalSeconds: totalSeconds.toNumber()
			});
			this.createCountdown();
		});
	}

	createCountdown(){

	var totalSeconds = this.state.totalSeconds;
	var totalSecs = this.state.totalSeconds;
	var hours =  Math.floor(totalSecs / 3600);
	totalSecs %= 3600;
	var minutes = Math.floor(totalSecs / 60);
	var seconds = totalSecs % 60;

	var id = '#' + this.instance.address;

	var Countdown = {
  
	// Backbone-like structure
	$el: $(id),
	
	// Params
	countdown_interval: null,
	total_seconds     : totalSeconds,

	// Initialize the countdown  
	init: function() {
	  
	  this.$ = {
		  hours  : this.$el.find('.bloc-time.hours .figure'),
		  minutes: this.$el.find('.bloc-time.min .figure'),
		  seconds: this.$el.find('.bloc-time.sec .figure')
	  };
  
	  this.values = {
		  hours: hours ,
		  minutes: minutes,
		  seconds: seconds,
	  };

	  this.count();    
	},
	
	count: function() {
	  
	  var that    = this,
		  $hour_1 = this.$.hours.eq(0),
		  $hour_2 = this.$.hours.eq(1),
		  $min_1  = this.$.minutes.eq(0),
		  $min_2  = this.$.minutes.eq(1),
		  $sec_1  = this.$.seconds.eq(0),
		  $sec_2  = this.$.seconds.eq(1);
	  
		  this.countdown_interval = setInterval(function() {
  
		  if(that.total_seconds > 0) {
  
			  --that.values.seconds;              
  
			  if(that.values.minutes >= 0 && that.values.seconds < 0) {
  
				  that.values.seconds = 59;
				  --that.values.minutes;
			  }
  
			  if(that.values.hours >= 0 && that.values.minutes < 0) {
  
				  that.values.minutes = 59;
				  --that.values.hours;
			  }
  
			  // Update DOM values
			  // Hours
			  that.checkHour(that.values.hours, $hour_1, $hour_2);
  
			  // Minutes
			  that.checkHour(that.values.minutes, $min_1, $min_2);
  
			  // Seconds
			  that.checkHour(that.values.seconds, $sec_1, $sec_2);
  
			  --that.total_seconds;
		  }
		  else {
			  clearInterval(that.countdown_interval);
		  }
	  }, 1000);    
	},
	
	animateFigure: function($el, value) {
	  
	   var that         = $(document),
			   $top         = $el.find('.top'),
		   $bottom      = $el.find('.bottom'),
		   $back_top    = $el.find('.top-back'),
		   $back_bottom = $el.find('.bottom-back');
  
	  $back_top.find('span').html(value);

	  $back_bottom.find('span').html(value);
  
	  // Then animate
	  TweenMax.to($top, 0.8, {
		  rotationX           : '-180deg',
		  transformPerspective: 300,
			ease                : Quart.easeOut,
		  onComplete          : function() {
  
			  $top.html(value);
  
			  $bottom.html(value);
  
			  TweenMax.set($top, { rotationX: 0 });
		  }
	  });
  
	  TweenMax.to($back_top, 0.8, { 
		  rotationX           : 0,
		  transformPerspective: 300,
			ease                : Quart.easeOut, 
		  clearProps          : 'all' 
	  });    
	},
	
	checkHour: function(value, $el_1, $el_2) {
	  
	  var val_1       = value.toString().charAt(0),
		  val_2       = value.toString().charAt(1),
		  fig_1_value = $el_1.find('.top').html(),
		  fig_2_value = $el_2.find('.top').html();
  
	  if(value >= 10) {
  
		  // Animate only if the figure has changed
		  if(fig_1_value !== val_1) this.animateFigure($el_1, val_1);
		  if(fig_2_value !== val_2) this.animateFigure($el_2, val_2);
	  }
	  else {
  
		  // If we are under 10, replace first figure with 0
		  if(fig_1_value !== '0') this.animateFigure($el_1, 0);
		  if(fig_2_value !== val_1) this.animateFigure($el_2, val_1);
	  }    
	}
  };
  	Countdown.init();
	}

    render() {

		const { itemName, startPrice, description, thumbnailURL } = this.state;
		console.log(this.state);
        return (
                    <div className="auction-display">
                        <div className="status-bar">

  	<div className="countdown" id={this.instance.address}>
    <div className="bloc-time hours" data-init-value="24">
      <div className="figure hours hours-1">
        <span className="top">2</span>
        <span className="top-back">
          <span>2</span>
        </span>
        <span className="bottom">2</span>
        <span className="bottom-back">
          <span>2</span>
        </span>
      </div>

      <div className="figure hours hours-2">
        <span className="top">4</span>
        <span className="top-back">
          <span>4</span>
        </span>
        <span className="bottom">4</span>
        <span className="bottom-back">
          <span>4</span>
        </span>
      </div>
    </div>

    <div className="bloc-time min" data-init-value="0">
      <div className="figure min min-1">
        <span className="top">0</span>
        <span className="top-back">
          <span>0</span>
        </span>
        <span className="bottom">0</span>
        <span className="bottom-back">
          <span>0</span>
        </span>        
      </div>

      <div className="figure min min-2">
       <span className="top">0</span>
        <span className="top-back">
          <span>0</span>
        </span>
        <span className="bottom">0</span>
        <span className="bottom-back">
          <span>0</span>
        </span>
      </div>
    </div>

    <div className="bloc-time sec" data-init-value="0">
        <div className="figure sec sec-1">
        <span className="top">0</span>
        <span className="top-back">
          <span>0</span>
        </span>
        <span className="bottom">0</span>
        <span className="bottom-back">
          <span>0</span>
        </span>          
      </div>

      <div className="figure sec sec-2">
        <span className="top">0</span>
        <span className="top-back">
          <span>0</span>
        </span>
        <span className="bottom">0</span>
        <span className="bottom-back">
          <span>0</span>
        </span>
      </div>
    </div>
  				</div>
                        </div>
                        <div className="image-wraper">
                            <img className="auction-item" src={thumbnailURL}></img>
                        </div>
                        <div className="description">
                            <h3 className="description-title">{itemName}</h3>
                                <a className="description-desc">
                                    {description}
                                </a>
                                <div>
                                    <span className="description-price">{startPrice}</span>
                                </div>
                        </div>
                        <button className="button-bid" data-id={this.instance.address} data-toggle="modal" data-target="#detailsModal">+ Details</button>
                    </div>
        )
    }

    getItemName(){
       return this.itemName;
    }

    getPrice(){
		return this.startPrice;
    }

    getDescription(){
		return this.description;
    }

    getThumbnailURL(){
       return this.thumbnailURL;
    }

}

class App extends React.Component {
    constructor(props) {
		super();

        this.state = {
            auctions: localStorage.getObj('auctions').map(x => AuctionContract.at(x))
		}
		
		this.renderAll = this.renderAll.bind(this);
		this.renderOnlyActive = this.renderOnlyActive.bind(this);
		this.renderInactive = this.renderInactive.bind(this);
    }


	renderAll(){
		
	}

	renderOnlyActive(){

	}

	renderInactive(){

	}

    render() {

		const auctions = this.state.auctions;

        return ( 
            <div>
            <header>
                <div className="contrast-section">
                    As useless as it gets
                </div>
            <nav className="navbar navbar-expand-lg navbar-light">

        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false"
            aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
                <li className="nav-item active">
                    <span>
                        <a className="nav-link" href="#" onClick={this.renderAll}>All</a>
                    </span>
                </li>
                <li className="nav-item">
                    <span>
                        <a className="nav-link" href="#" onClick={this.renderOnlyActive}>Active</a>
                    </span>
                </li>
                <li className="nav-item">
                    <span>
                        <a className="nav-link" href="#" onClick={this.renderInactive}>Inactive</a>
                    </span>
                </li>
            </ul>
        </div>
        <a className="navbar-brand centered" href="#">
            <img src="./logo.png"></img>
        </a>
        <div className="nav-item">
            <ul className="navbar-nav">
                <li className="nav-link">
                    <span className="offseted-left">
                        <a className="nav-link mr-sm-2" href="#" data-toggle="modal" data-target="#myModal">Sell</a>
                    </span>
                </li>
            </ul>
        </div>
    </nav>

    </header>

    <main>
        <div className="container-fluid">
            <div className="content">
                Powered by Bootstrap 4 and React
            </div>
        </div>

        <div className="container-fluid">

            <div className="row" id="content">
				{auctions.map(x => 
					<div className="col-6 col-sm-6 col-md-4 col-lg-3">
					<AuctionItem contractInstance={x} />
					</div>
				)}
            </div>
        </div>
    </main>
    <footer>
    <div className="container footer">
        <div>
            <p className="text-right">Powered by Bootstrap 4 and React
            </p>
        </div>
    </div>
    </footer>
    </div>
        )
    }

}
ReactDOM.render( 
	<App  /> ,
    document.querySelector('#root')
)

ReactDOM.render(
    < AuctionForm /> ,
    document.querySelector('#modal')
)

ReactDOM.render(
	<DetailsModalForm />,
    document.querySelector('#detailsModal #modal')
)
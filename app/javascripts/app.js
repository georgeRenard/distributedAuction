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

class AuctionBox extends React.Component {
	constructor(props) {
	  super(props);
	  this.parent = document.getElementById('root');
	}
  
	componentDidMount() {
	  parent.appendChild(this.props.auctions);
	}
  
	componentWillUnmount() {
	  parent.removeChild(this.props.auctions);
	}
  
	render() {
	  return ReactDOM.createPortal(
		this.props.children,
		this.parent,
	  );
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
			thumbnailURL: ""
		}

		this.instance = props.contractInstance;
    }

	componentDidMount(){

		Promise.all([
			this.instance.getItemName.call(),
			this.instance.getPrice.call(),
			this.instance.getDescription.call(),
			this.instance.getThumbnailURL.call()
		]).then((response) => {
			let itemName = response[0];
			let startPrice = response[1];
			let description = response[2];
			let thumbnailURL = response[3];
			this.setState({
				itemName: itemName,
				 startPrice: web3.fromWei(startPrice.toNumber(), "ether" ),
				  description: description,
				   thumbnailURL: thumbnailURL
			});
		});
	}

    render() {

		const { itemName, startPrice, description, thumbnailURL } = this.state;
		console.log(this.state);
        return (
                    <div className="auction-display">
                        <div className="status-bar">

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
                        <button className="button-bid">+ Details</button>
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
                        <a className="nav-link" href="#">All</a>
                    </span>
                </li>
                <li className="nav-item">
                    <span>
                        <a className="nav-link" href="#" data-toggle="modal" data-target="#detailsModal">Active</a>
                    </span>
                </li>
                <li className="nav-item">
                    <span>
                        <a className="nav-link" href="#">Inactive</a>
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
				{auctions.map(x => <AuctionItem contractInstance={x} />)}
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
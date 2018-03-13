import React from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3'

import './../stylesheets/app.css';

const AuctionContractABI = [
	{
		"constant": true,
		"inputs": [],
		"name": "getThumbnailURL",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "terminate",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_addr",
				"type": "address"
			},
			{
				"name": "_secret",
				"type": "string"
			}
		],
		"name": "allowBidder",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "bid",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getDescription",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "span",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "MAX_TITLE_LENGTH",
		"outputs": [
			{
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "withdrawBid",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "MAX_DESCRIPTION_LENGTH",
		"outputs": [
			{
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getPrice",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "today",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "timestamp",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getItemName",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "item",
		"outputs": [
			{
				"name": "itemName",
				"type": "string"
			},
			{
				"name": "description",
				"type": "string"
			},
			{
				"name": "thumbnailURL",
				"type": "string"
			},
			{
				"name": "startPrice",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"name": "_title",
				"type": "string"
			},
			{
				"name": "_description",
				"type": "string"
			},
			{
				"name": "_thumbnailURL",
				"type": "string"
			},
			{
				"name": "_startPrice",
				"type": "uint256"
			},
			{
				"name": "_timespan",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"payable": true,
		"stateMutability": "payable",
		"type": "fallback"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "initiator",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "Start",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "winner",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "End",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "bidder",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Bidding",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "Terminated",
		"type": "event"
	}
]

class AuctionForm extends React.Component {
    
    constructor(){
        super();
        this.auction = {};
    }

    handleSubmit(event){



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
                            <label htmlFor="price">Starting Price (ether)</label>
                            <input type="number" className="form-control" id="price" onChange={this.handlePriceChange}/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">Description (255 characters)</label>
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
                                <input type="checkbox" className="form-check-input"/> I Agree that upon termination i will get charged a flat rate of 0.01 ether
                            </label>
                        </div>
                        <button type="submit" id="submitAuction" className="btn btn-primary">Submit</button>
            </form>
        )
    }
}

class AuctionItem extends React.Component {

    constructor(contractInstance){
        super();
        this.instance = contractInstance;
    }

    render() {
        return (
            <div className="col-6 col-sm-6 col-md-4 col-lg-3">
                    <div className="auction-display">
                        <div className="status-bar">

                        </div>
                        <div className="image-wraper">
                            <img className="auction-item" src={this.getThumbnailURL()}></img>
                        </div>
                        <div className="description">
                            <h3 className="description-title">{this.getItemName}</h3>
                                <a className="description-desc">
                                    {this.getDescription}
                                </a>
                                <div>
                                    <span className="description-price">{this.getPrice}</span>
                                </div>
                        </div>
                        <button className="button-bid">+ Details</button>
                    </div>
                </div>
        )
    }

    getItemName(){
        
        this.instance.getItemName().then((err,res) => {
            if(err || !res){
                return "Error";
            }
            return res;
        });

    }

    getPrice(){

        this.instance.getItemPrice().then((err,res) => {
            if(err || !res){
                return "Price error";
            }

            return parseInt(res);
        });
    }

    getDescription(){

        this.instance.getDescription().then((err,res) => {
            if(err || !res){
                return "Price error";
            }

            return res;
        });
    }

    getThumbnailURL(){
        this.instance.getThumbnailURL().then((err,res) => {
            if(err || !res){
                return "Error";
            }

            return res;
        })
    }

}

class App extends React.Component {
    constructor(auctionContract) {
        super();
        this.state = {
            auctions: auctionContract || []
        }

        if (typeof web3 != 'undefined') {
            console.log("Using web3 detected from external source like Metamask")
            this.web3 = new Web3(web3.currentProvider)
        } else {
            this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
        }
    }

    render() {
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

            <div className="row">

                {this.populateAuctions()}
                                
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

    handleSubmit(e) {
        e.preventDefault();

    }

    populateAuctions(){
        //for(var instance in this.state.auctions){
        //    new AuctionItem(instance).render();
        //}
    }

}
ReactDOM.render( <
    App / > ,
    document.querySelector('#root')
)

ReactDOM.render(
    < AuctionForm /> ,
    document.querySelector('#modal')
)
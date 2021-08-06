import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import "./App.css";

let LotteryAddress = '0x061339A88E0b5381D7880f273D666aE4F1725D18';
let lotteryABI = [ { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "index", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "bettor", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bytes1", "name": "challenges", "type": "bytes1" }, { "indexed": false, "internalType": "uint256", "name": "answerBlockNumber", "type": "uint256" } ], "name": "BET", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "index", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "bettor", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bytes1", "name": "challenges", "type": "bytes1" }, { "indexed": false, "internalType": "bytes1", "name": "answer", "type": "bytes1" }, { "indexed": false, "internalType": "uint256", "name": "answerBlockNumber", "type": "uint256" } ], "name": "DRAW", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "index", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "bettor", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bytes1", "name": "challenges", "type": "bytes1" }, { "indexed": false, "internalType": "bytes1", "name": "answer", "type": "bytes1" }, { "indexed": false, "internalType": "uint256", "name": "answerBlockNumber", "type": "uint256" } ], "name": "FAIL", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "index", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "bettor", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bytes1", "name": "challenges", "type": "bytes1" }, { "indexed": false, "internalType": "uint256", "name": "answerBlockNumber", "type": "uint256" } ], "name": "REFUND", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "index", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "bettor", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bytes1", "name": "challenges", "type": "bytes1" }, { "indexed": false, "internalType": "bytes1", "name": "answer", "type": "bytes1" }, { "indexed": false, "internalType": "uint256", "name": "answerBlockNumber", "type": "uint256" } ], "name": "WIN", "type": "event" }, { "inputs": [], "name": "answerForTest", "outputs": [ { "internalType": "bytes32", "name": "", "type": "bytes32" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address payable", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "getPot", "outputs": [ { "internalType": "uint256", "name": "pot", "type": "uint256" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [ { "internalType": "bytes1", "name": "challenges", "type": "bytes1" } ], "name": "betAndDistribute", "outputs": [ { "internalType": "bool", "name": "result", "type": "bool" } ], "stateMutability": "payable", "type": "function", "payable": true }, { "inputs": [ { "internalType": "bytes1", "name": "challenges", "type": "bytes1" } ], "name": "bet", "outputs": [ { "internalType": "bool", "name": "result", "type": "bool" } ], "stateMutability": "payable", "type": "function", "payable": true }, { "inputs": [], "name": "distribute", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "bytes32", "name": "answer", "type": "bytes32" } ], "name": "setAnswerForTest", "outputs": [ { "internalType": "bool", "name": "result", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "bytes1", "name": "challenges", "type": "bytes1" }, { "internalType": "bytes32", "name": "answer", "type": "bytes32" } ], "name": "isMatch", "outputs": [ { "internalType": "enum Lottery.BettingResult", "name": "", "type": "uint8" } ], "stateMutability": "pure", "type": "function", "constant": true }, { "inputs": [ { "internalType": "uint256", "name": "index", "type": "uint256" } ], "name": "getBetInfo", "outputs": [ { "internalType": "uint256", "name": "answerBlockNumber", "type": "uint256" }, { "internalType": "address", "name": "bettor", "type": "address" }, { "internalType": "bytes1", "name": "challenges", "type": "bytes1" } ], "stateMutability": "view", "type": "function", "constant": true } ]

class App extends Component {
  

  constructor(props){
    super(props);

    this.state = { 
      web3: null, 
      accounts: null, 
      contract: null,
      betRecord: [],
      winRecord: [],
      failRecord: [],
      pot: '0',
      challenges: ['A','B'],
      finalRecord: [{
        better:'0xabcd...',
        challenges: 'ab',
        targetBlockNUmber: '10',
        pot: '0'
      }]
    }
  }

  componentDidMount = async () => {
    await this.initWeb3();
    //await this.pollData();
    setInterval(this.pollData, 1000);
    
  };

  pollData = async () => {
    await this.getPot();
    await this.getBetEvents();
    await this.getWinEvents();
    await this.getFailEvents();
    await this.makeFinalRecords();
  }

  initWeb3 = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const LotteryContract = new web3.eth.Contract(lotteryABI,LotteryAddress);
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: LotteryContract });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
    this.account = this.state.accounts[0]
  }

  getPot = async () => {
    let pot = await this.state.contract.methods.getPot().call()
    pot = this.state.web3.utils.fromWei(pot.toString(), 'ether')
    this.setState({pot: pot})
  } 

  makeFinalRecords = () => {
    let f=0, w=0;
    const records = [...this.state.betRecord]
    for(let i=0;i<records.length; i++){
      if(this.state.winRecord.length > 0 && this.state.betRecord[i].index === this.state.winRecord[w].index){
        records[i].win = 'WIN'
        records[i].answer = records[i].challenges;
        console.log('adfasdf')
        records[i].pot = this.state.web3.utils.fromWei(this.state.winRecord[w].amount, 'ether');
        if(this.state.winRecord.length - 1 > w) w++;
        
      }else if(this.state.failRecord.length > 0 && this.state.betRecord[i].index === this.state.failRecord[f].index){
        records[i].win = 'FAIL'
        records[i].answer = this.state.failRecord[f].answer;
        records[i].pot = 0;
        if(this.state.failRecord.length - 1> f) f++;
        
      }else {
        records[i].answer = 'Not Revealed';
      }
    }
    console.log(records)
    this.setState({finalRecord: records})
  }

  getBetEvents = async () => {
    const records = [];
    let events = await this.state.contract.getPastEvents('BET', {fromBlock: 0, toBlock: 'latest'})

    for(let i=0;i<events.length;i++){
      const record = {}
      record.index = parseInt(events[i].returnValues.index, 10).toString();
      record.bettor = events[i].returnValues.bettor.slice(0,4) + '...' +events[i].returnValues.bettor.slice(40,42);
      record.betBlockNumber = events[i].betBlockNumber;
      record.targetBlockNumber = events[i].returnValues.answerBlockNumber.toString();
      record.challenges = events[i].returnValues.challenges;
      record.win = 'Not Revealed';
      record.answer = '0x00';
      records.unshift(record);
    }
    this.setState({betRecord: records})
  }

  getWinEvents = async () => {
    const records = [];
    let events = await this.state.contract.getPastEvents('WIN', {fromBlock: 0, toBlock: 'latest'})
    for(let i=0;i<events.length;i++){
      const record = {}
      record.index = parseInt(events[i].returnValues.index, 10).toString();
      record.amount = parseInt(events[i].returnValues.amount, 10).toString();
      records.unshift(record);
    }
    
    this.setState({winRecord: records})
  }

  getFailEvents = async () => {
    const records = [];
    let events = await this.state.contract.getPastEvents('FAIL', {fromBlock: 0, toBlock: 'latest'})
    
    for(let i=0;i<events.length;i++){
      const record = {}
      record.index = parseInt(events[i].returnValues.index, 10).toString();
      record.answer = events[i].returnValues.answer;
      records.unshift(record);
    }
    console.log(records)
    this.setState({failRecord: records})
  }

  bet = async () => {
    //nonce

    let challenges = '0x' + this.state.challenges[0].toLowerCase() + this.state.challenges[1].toLowerCase();
    let nonce = await this.state.web3.eth.getTransactionCount(this.state.accounts[0]);
    this.state.contract.methods.betAndDistribute(challenges).send({from: this.state.accounts[0], value: 5000000000000000, gas: 300000, nonce: nonce})
    .on('transactionHash', (hash) => {
      console.log(hash);
    })
  }
  
  
  // Pot money

  //bet 글자 선택 UI(button)
  //Bet button

  //History table
  //index address challenge answer pot status answerBlockNumber

  onClickCard = (_Character) => {
    this.setState({
      challenges: [this.state.challenges[1], _Character]
    })
  }
  getCard = (_Character, _cardStyle) => {
    let _card = '';
    if(_Character ==='A'){
      _card= '🂡'
    }
    else if(_Character ==='B'){
      _card= '🂱'
    }
    else if(_Character ==='C'){
      _card= '🃁'
    }
    else if(_Character ==='D'){
      _card= '🃑'
    }

    return(
      <button className={_cardStyle} onClick={() => {
        this.onClickCard(_Character)
      }}>
        <div className="card-body text-center">
          <p className="card-text"></p>
          <p className="card-text test-center" style={{fontSize:300}}>{_card}</p>
          <p className="card-text"></p>
        </div>
      </button>
    );
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">

        {/*Header - Pot, Betting characters */}
        <div className="container">
          <div className="jumbotron">
            <h1>Current Pot:{this.state.pot}</h1>
            <h1>Lottery</h1>
            <p>Your Bet</p>
            <p>{this.state.challenges[0]} {this.state.challenges[1]}</p>
          </div>
        </div>

        {/* Card section */}
        <div className="container">
          <div className="card-group">
            {this.getCard("A","card bg-primary")}
            {this.getCard("B","card bg-warning")}
            {this.getCard("C","card bg-danger")}
            {this.getCard("D","card bg-success")}
          </div>
        </div>

        <br></br>
        <div className="container">
          <button className="btn btn-danger btn-lg" onClick={this.bet}>BET!</button>
        </div>
        <br></br>

        <div className="container">
          <table className="table table-dark table-striped">
            <thead>
              <tr>
                <th>Index</th>
                <th>Address</th>
                <th>Challenge</th>
                <th>answer</th>
                <th>Pot</th>
                <th>Status</th>
                <th>AnswerBlockNumber</th>
              </tr>
            </thead>
            <tbody>
              {
                this.state.finalRecord.map((record, index) => {
                  return (
                    <tr key={index}>
                      <td>{record.index}</td>
                      <td>{record.bettor}</td>
                      <td>{record.challenges}</td>
                      <td>{record.answer}</td>
                      <td>{record.pot}</td>
                      <td>{record.win}</td>
                      <td>{record.targetBlockNumber}</td>
                    </tr>

                  );
                })
              }
            </tbody>
          </table>
        </div>

      </div>



    );
  }
}

export default App;

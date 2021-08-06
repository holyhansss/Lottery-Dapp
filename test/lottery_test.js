const Lottery = artifacts.require("Lottery");
const assertRevert = require('./assertRevert');
const expectEvent = require('./expectEvent');

contract('Lottery',function([deployer, user1, user2]){
    let lottery;
    let betAmount = 5 * 10 ** 15;
    let bet_block_interval = 3;
    let betAmountBN = new web3.utils.BN('5000000000000000');
    beforeEach(async() => {
        console.log('Before each');
        lottery = await Lottery.new();
    })

    it('getPot should return current pot', async ()=> {
        let pot = await lottery.getPot();
        assert.equal(pot, 0)
    })

    describe('Bet',function (){
        it('should fail when the bet money is not 0.005 ETH', async ()=> {
            // Fail transaction
                await assertRevert(lottery.bet("0xab",{from : user1, value : 4000000000000000}))
            // transaction object {chainId, value, to, from, gas(Limit), gasPrice}

        })
        it('should put the bet to the bet queue with 1 bet', async ()=> {
            // Bet
            let receipt = await lottery.bet("0xab",{from : user1, value : betAmount})
            //console.log(receipt);
            let pot = await lottery.getPot();
            assert.equal(pot, 0);
            //check contract balance = 0.005
            let contractBalance = await web3.eth.getBalance(lottery.address);
            assert.equal(contractBalance, betAmount);
            
            //check bet info 
                let currentBlockNumber = await web3.eth.getBlockNumber();
                let bet = await lottery.getBetinfo(0);

                assert.equal(bet.answerBlockNumber, currentBlockNumber + bet_block_interval);
                assert.equal(bet.bettor, user1);
                assert.equal(bet.challenges, '0xab');
               
            //check log 
            console.log(receipt);
            await expectEvent.inLogs(receipt.logs, 'BET')
        })
        describe('Distribute',function() {
            describe('When the answer is checkable', function() {
                it('should give the user the pot when the answer matches', async () => {
                    // 두 글자 다 맞았을때

                    await lottery.setAnswerForTest('0xab38c8784cad8308b269ca9b5270cd13dd828889d28001184169ed73ca02aaae', {from : deployer});
                    
                    await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 1 -> 4번블락에 betting
                    await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 2
                    await lottery.betAndDistribute('0xab', {from : user1, value : betAmount}) // 3
                    await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 4
                    await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 5
                    await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 6
                    
                    let potBefore = await lottery.getPot();
                    let user1BalanceBefore = await web3.eth.getBalance(user1);                    
                    
                    let receipt7 = await lottery.betAndDistribute('0xef', {from : user2, value : betAmount})

                    let potAfter = await lottery.getPot(); // == 0
                    let user1BalanceAfter = await web3.eth.getBalance(user1); // before + 0.015ETH             
                    
                    assert.equal(potBefore.toString(), new web3.utils.BN('10000000000000000').toString());
                    assert.equal(potAfter.toString(), new web3.utils.BN('0').toString());

                    // pot의 변화량 확인
                   // assert.equal(potBefore, )
                    //user(winner)의 벨런스 확인 
                    user1BalanceBefore = new web3.utils.BN(user1BalanceBefore);
                    assert.equal(user1BalanceBefore.add(potBefore).add(betAmountBN).toString(), new web3.utils.BN(user1BalanceAfter).toString());
                })
                it('should give the user amount he bet when a single character matches', async () => {
                    // 한 글자 다 맞았을때

                    await lottery.setAnswerForTest('0xab38c8784cad8308b269ca9b5270cd13dd828889d28001184169ed73ca02aaae', {from : deployer});
                    
                    await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 1 -> 4번블락에 betting
                    await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 2
                    await lottery.betAndDistribute('0xac', {from : user1, value : betAmount}) // 3
                    await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 4
                    await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 5
                    await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 6
                    
                    let potBefore = await lottery.getPot();
                    let user1BalanceBefore = await web3.eth.getBalance(user1);                    
                    
                    let receipt7 = await lottery.betAndDistribute('0xef', {from : user2, value : betAmount})

                    let potAfter = await lottery.getPot(); // == 0.01
                    let user1BalanceAfter = await web3.eth.getBalance(user1); // before + 0.005ETH             
                    
                    // pot의 변화량 확인
                    assert.equal(potBefore.toString(), potAfter.toString());   


                    //user(winner)의 벨런스 확인 
                    user1BalanceBefore = new web3.utils.BN(user1BalanceBefore);
                    assert.equal(user1BalanceBefore.add(betAmountBN).toString(), new web3.utils.BN(user1BalanceAfter).toString());


                })
                it('should get the eth of user when the answer does not match at all', async () => {
                    // 다 틀렸을때
                    await lottery.setAnswerForTest('0xab38c8784cad8308b269ca9b5270cd13dd828889d28001184169ed73ca02aaae', {from : deployer});
                    
                    await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 1 -> 4번블락에 betting
                    await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 2
                    await lottery.betAndDistribute('0xef', {from : user1, value : betAmount}) // 3
                    await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 4
                    await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 5
                    await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 6
                    
                    let potBefore = await lottery.getPot(); // == 0.01
                    let user1BalanceBefore = await web3.eth.getBalance(user1);                    
                    console.log(user1BalanceBefore);
                    let receipt7 = await lottery.betAndDistribute('0xef', {from : user2, value : betAmount})

                    let potAfter = await lottery.getPot(); // == 0.015
                    let user1BalanceAfter = await web3.eth.getBalance(user1); // before              
                    
                    assert.equal(potBefore.add(betAmountBN).toString(), potAfter.toString());

                    // pot의 변화량 확인
                   // assert.equal(potBefore, )
                    //user(winner)의 벨런스 확인 
                    user1BalanceBefore = new web3.utils.BN(user1BalanceBefore);
                    assert.equal(user1BalanceBefore.toString(), new web3.utils.BN(user1BalanceAfter).toString());

                })
            })
            describe('When the answer is not revealed(Not Mined)', function() {
                /*it.only('should wait for block to be mined', async () => {
                    let potBefore = await lottery.getPot(); // == 0.01

                    
                    assert.equal()


                }) */
            })
            describe('When the aswer is not revealed(Blocklimit passed)', function() {

            })
        })

        
        describe('isMatch',function() {
            let blockHash = '0xab38c8784cad8308b269ca9b5270cd13dd828889d28001184169ed73ca02aaae'
            it('should be BettingResult.Win when two characters match', async () =>{
                let matchingResult = await lottery.isMatch('0xab',blockHash);
                assert.equal(matchingResult, 1)
            })
            
            it('should be BettingResult.Fail when two characters does not match', async () =>{
                let matchingResult = await lottery.isMatch('0xcd',blockHash);
                assert.equal(matchingResult, 0)
            })

            it('should be BettingResult.Draw when one character match', async () =>{
                let matchingResult = await lottery.isMatch('0xaf',blockHash);
                assert.equal(matchingResult, 2)
                
                matchingResult = await lottery.isMatch('0xfb',blockHash);
                assert.equal(matchingResult, 2)
            })


        })


    })
});
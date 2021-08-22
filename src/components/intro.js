import React, { useContext } from 'react';
import { Row, Container, Col, Button } from 'reactstrap';
import { WalletContext } from '../context/Wallet';

function Intro(props) {
    const connect = useContext(WalletContext).connect
    return (
    <Container>
        <Row style={{marginTop:'10vh', minHeight:'50vh', zIndex:'-1', textAlign:'center'}}>
            <Col sm='12' md={{ size: 6, offset: 3}}>
                    <h1 style={{
                        color:'#45fff4',
                        fontFamily:'Jura',
                        fontWeight:'bold',
                        lineHeight:'125%',
                        fontSize:'46px',
                        textTransform:'uppercase'
                        }}>Hegic Staking Lots for everyone</h1>
                    <div style={{color: '#defefe', fontFamily:'Exo 2', fontWeight:'500', lineHeight:'150%'}}>
                    Hegic Protocol generates fees that are distributed among Hegic Staking Lot owners.
                    Those staking lots are priced at 888,000 HEGIC, being simply unreachable for most of HEGIC holders.
                    Thanks to <b>Staking Pools</b> you can own a share of a staking lot and earn fees that were reserved
                    for whales only. 
                    </div>
                    <div style={{marginTop:'25px', display:'flex', justifyContent:'center'}}>
                    <Button className="main-button"
                        onClick={connect}>CONNECT WALLET</Button>
                    </div>
            </Col>
        </Row>
    </Container>);
}

export default Intro;
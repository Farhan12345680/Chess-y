import {View , ScrollView , Text , TextInput,Pressable} from "react-native"
import {useState,useRef} from "react"
import Input from "./component/input"
import {link} from "expo-router" 


// three life cycle states typing -> checking/loading -> result

export default function Login(){
    const [signUPData , changeSignUPData]=useState({
        name:"",
        password:"",
        country:"",
        bearerToken:"",
        signUPState:"", //typing ="" -> loading = "load" -> result/finish  
        newWebSocket:""
    })



    return (
        <ScrollView>

        <Input labelText={"Name"} changeInputState={(Text)=>{
            changeSignUPData({
                ...signUPData,
                name:Text

            })
        }}>

        </Input>

        <Input labelText={"Password"} changeInputState={(Text)=>{
            changeSignUPData({
                ...signUPData,
                password:Text

            })
        }}>

        </Input>
        <Input labelText={"Country"} changeInputState={(Text)=>{
            changeSignUPData({
                ...signUPData,
                country:Text

            })
        }}>

        </Input>
        
            
            <Pressable onPress={(()=>{
                
            })}>
            
            </Pressable>

        <Link href="/signup">
        
            <Pressable >
                <Text>Don't have any Account</Text>
            </Pressable>
        </Link>
        
        </ScrollView>
    )
}
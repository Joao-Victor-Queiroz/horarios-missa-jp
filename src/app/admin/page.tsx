import { Input, Label, TextField } from "@heroui/react";
import { PageTitle } from "@/src/components/Title";

export default function Page(){
   return(
    <div> 
        <PageTitle title="Cadastrar Nova Paróquia"/>
        <TextField isRequired>
            <Label htmlFor="name">Nome da paróquia</Label>
            <Input id="name" placeholder="Ex: Santuário Mãe Rainha"/>
        </TextField>
    </div>
   )
}
class UserController{
    constructor(formIdCreate,formIdUpdate,tableId){
        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();
        this.selectAll();
    }
    onEdit(){
        document.querySelector("#box-user-update .btn-default").addEventListener('click',e=>{
            this.showPanelCreate();
        })
       this.formUpdateEl.addEventListener("submit",event=>{
           console.log('event')
           event.preventDefault();
           let btn = this.formUpdateEl.querySelector("[type=submit]");
           btn.disabled=true;
            let values = this.getValues(this.formUpdateEl);

            
            let index =  this.formUpdateEl.dataset.trIndex
            let row = this.tableEl.rows[index]
            
            let userOld = JSON.parse(row.dataset.user);

            let result = Object.assign({}, userOld,values);

            
           
            
            
        this.addEventsTr(row)
        this.updateCount();
        btn.disabled = false;

      


        this.getPhoto(this.formUpdateEl).then(
            (content)=>{
                if(!values.photo) {
                    result._photo = userOld._photo;
                }else{
                    result._photo = content;
                }
              
                
                row.innerHTML =`     <tr>
                <td><img src="${result._photo}" alt="User Image" class="img-circle img-sm"></td>
                        <td>${result._name}</td>
                        <td>${result._email}</td>
                        <td>${(result._admin) ? 'Sim':'Não'}</td>
                        <td>${Utils.dateFormat(result._register)}</td>
                        <td>
                        <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                        <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
                         </td>
                </tr>`
            
            btnSubmit.disabled = false;

                this.formUpdateEl.reset();
                
        this.showPanelCreate();

            },
            (e)=>{
                console.error(e);
            });

       })
    }

    getTr(dataUser,tr = null){

        
        if(tr == null) tr = document.createElement('tr');

        tr.dataset.user = JSON.stringify(dataUser);


        tr.innerHTML = `     <tr>
                <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
                        <td>${dataUser.name}</td>
                        <td>${dataUser.email}</td>
                        <td>${(dataUser.admin) ? 'Sim':'Não'}</td>
                        <td>${Utils.dateFormat(dataUser.register)}</td>
                        <td>
                        <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                        <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
                         </td>
                </tr>`;
        this.addEventsTr(tr);
        return tr;
            
    }
    showPanelCreate(){
        document.querySelector("#box-user-create").style.display="block";
        document.querySelector("#box-user-update").style.display="none"
    }
    showPanelUpdate(){
        document.querySelector("#box-user-create").style.display="none";
        document.querySelector("#box-user-update").style.display="block"
    }
    addEventsTr(tr){
          
        tr.querySelector(".btn-edit").addEventListener('click',e=>{
 
            let json = JSON.parse(tr.dataset.user)
            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

            for(let name in json){
                let field = this.formUpdateEl.querySelector("[name="+name.replace("_","")+"]");
                if(field){
                   
                    switch(field.type){
                        case 'file':
                            continue;
                            break;
                        case 'radio':
                            console.log(json[name])
                            field = this.formUpdateEl.querySelector("[name="+name.replace("_","")+"][id="+json[name]+"]");
                            console.log(field)
                            field.checked = true;
                            break;

                        case 'checkbox':
                         
                            field.checked = json[name]    
                        break;
                        default:
                            field.value = json[name];
                            

                    }
                    field.value = json[name];
                }
                
            }
            this.formUpdateEl.querySelector(".photo").src = json._photo;
            this.showPanelUpdate();

        })
        tr.querySelector(".btn-delete").addEventListener('click',e=>{
            if(confirm("Deseja Realmente excluir?")){
                tr.remove();
                this.updateCount()
            }
        })
    }
    getUsersStorage(){
        let users = [];
        if(localStorage.getItem("users")){
            //users = JSON.parse(sessionStorage.getItem("users"))
            users = JSON.parse(localStorage.getItem("users"))
        }
        return users;
    }
    selectAll(){
        let users =this.getUsersStorage() ;
        users.forEach(dataUser=>{
            let user = new User();
            user.loadFromJSON(dataUser);
            this.addLine(user);
        })
       


    }

    insert(data){
        let users = this.getUsersStorage();
        users.push(data);
        //sessionStorage.setItem("users",JSON.stringify(users));

        localStorage.setItem("users",JSON.stringify(users));
    }

    addLine(dataUser){
        let tr = this.getTr(dataUser); 
        this.tableEl.appendChild(tr);
        this.updateCount();
      
    }

  
    updateCount(){
        let numberUsers = 0;
        let numberAdmin = 0;
        [...this.tableEl.children].forEach(tr=>{
            numberUsers++;
            let user = JSON.parse(tr.dataset.user);
            if(user._admin) numberAdmin++;
        });
        document.querySelector("#number-users").innerHTML = numberUsers;
        document.querySelector("#number-users-admin").innerHTML = numberAdmin;
       // console.log("admin",numberAdmin,"user",numberUsers)
    }
    onSubmit(){
        //arrow function nao muda o scopo do this internamente.
        this.formEl.addEventListener("submit",(event)=>{
            event.preventDefault();
            let btnSubmit = this.formEl.querySelector("[type=submit]");

            btnSubmit.disabled = true;

            let values = this.getValues(this.formEl);
            if(values!=false){
            this.getPhoto(this.formEl).then(
                (content)=>{
                values.photo = content;
                this.insert(values);
                this.addLine(values);
                btnSubmit.disabled = false;

                    this.formEl.reset();

                },
                (e)=>{
                    console.error(e);
                });
                
            }
            btnSubmit.disabled = false;
        });
      
    }
    getPhoto(formEl){
        return new Promise((resolve,reject)=>{
            let fileReader = new FileReader();

            let elements = [...formEl.elements].filter(item=>{
                if(item.name =='photo'){
                    return  item;
                }
            });
    
            let file = elements[0].files[0];
            
            if(file){
                fileReader.readAsDataURL(file);
            }else{
               resolve('dist/img/boxed-bg.jpg')
            }
            fileReader.onload = ()=>{
                resolve(fileReader.result)
            };

            fileReader.onerror = (e)=>{
                reject(e);
            }
        })   
    }

    
    getValues(form){
        let user = {};
        let isValid = true;
        //convertendo colecao em array , spread
        [...form.elements].forEach(function(field,index){



        
            let name = field.name
            if(name == "gender" ){
                if(field.checked){
                  user[field.name]=field.id
                }
        
            }else if(field.name == "admin"){
                user[field.name] = field.checked
            
            }else{
                user[name] = field.value;
            }
        });
      
        if(!isValid){
            return false;
        } 
        let userDebug = new User(
            user.name,
            user.gender,
            user.birth,
            user.country,
            user.email,
            user.password,
            user.photo,
            user.admin
            
            );
       
        return userDebug
    
    }
    

}
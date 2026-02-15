document.addEventListener('DOMContentLoaded', () => {
    const newAccount=document.getElementById('createAccount');
    const signIn=document.getElementById('signin');
    const Signin_dialog=document.getElementById('Signin_dialog');
    const newAccount_dialog=document.getElementById('newAccount');
    const backdrop=document.getElementById('backdrop');
    const closeButton=document.querySelectorAll('.closeButton');
    const new_name=document.getElementById('new_name');
    const new_email=document.getElementById('new_email');
    const new_pswd=document.getElementById('new_pswd');
    const new_dob=document.getElementById('new_dob');
    const confirm_pswd=document.getElementById('confirm_pswd');
    const name = document.getElementById('name');
    const pswd = document.getElementById('pswd');
    const signin_button=document.getElementById('submit-button');
    const logging = document.getElementById('logging');
    const login_button=document.getElementById('submit-button2');
    const signup_link=document.getElementById('signup_link');
    let user={
        name:'',
        email:'',
        password:'',
        dob:'',
        uname:'',
        profile_pic:''
    };

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    const log = async () => {
        await sleep(2000);
        logging.style.display='none';
    };

    const updateButtonColor = () => {
        if (user.name && user.email && user.password && user.dob){
            signin_button.style.backgroundColor='#000';
            signin_button.disabled=false;
        } else {
            signin_button.style.backgroundColor='';
            signin_button.disabled=true;
        }
    };

    log();

    newAccount.addEventListener('click',()=>{
        Signin_dialog.style.display='none';
        newAccount_dialog.style.display='block';
        backdrop.style.display='block';
    });

    signIn.addEventListener('click',()=>{
        newAccount_dialog.style.display='none';
        Signin_dialog.style.display='block';
        backdrop.style.display='block';
    });

    closeButton.forEach(button => {
        button.addEventListener('click', () => {
            newAccount_dialog.style.display='none';
            Signin_dialog.style.display='none';
            backdrop.style.display='none';
        });
    });

    new_name.addEventListener('input',()=>{
        const n=new_name.value;
        if (n.trim() === '') {
            document.getElementById('wrong_newname').style.display = 'none';
            user.name='';
        }
        else if((n.length<3 && n.length>0) || n.length>50){
            document.getElementById('wrong_newname').style.display='block';
            user.name='';
        }
        else{
            document.getElementById('wrong_newname').style.display='none';
            user.name=n;
        }
        updateButtonColor();
    });

    new_email.addEventListener('input',()=>{
        const e=new_email.value;
        const email_pattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (e.trim() === '') {
            document.getElementById('wrong_email').style.display = 'none';
            user.email='';
        }
        else if(!email_pattern.test(e)){
            document.getElementById('wrong_email').style.display='block';
            user.email='';
        }
        else{
            document.getElementById('wrong_email').style.display='none';
            user.email=e;
        }
        updateButtonColor();
    }); 

    new_pswd.addEventListener('input',()=>{
        const p=new_pswd.value;

        if (p.trim() === '') {
            document.getElementById('weak_pswd').style.display = 'none';
            user.password='';
        }
        else if(p.length<8){
            document.getElementById('weak_pswd').style.display='block';
            user.password='';
        }
        else if(!/[A-Z]/.test(p)){
            document.getElementById('weak_pswd').style.display='block';
            user.password='';
        }
        else if(!/[a-z]/.test(p)){
            document.getElementById('weak_pswd').style.display='block';
            user.password='';
        }
        else if(!/[0-9]/.test(p)){
            document.getElementById('weak_pswd').style.display='block';
            user.password='';
        }
        else{
            document.getElementById('weak_pswd').style.display='none';
            user.password=p;
        }
        updateButtonColor();
    });

    confirm_pswd.addEventListener('input',()=>{
        const p=new_pswd.value;
        const cp=confirm_pswd.value;
        
        if (confirm_pswd.value.trim() === '') {
            document.getElementById('pswd_mismatch').style.display = 'none';
            user.password='';
        }
        else if(p!==cp){
            document.getElementById('pswd_mismatch').style.display='block';
            user.password='';
        }
        else{
            document.getElementById('pswd_mismatch').style.display='none';
            if (document.getElementById('weak_pswd').style.display === 'none') {
                user.password=p;
            }
        }
        updateButtonColor();
    });

    new_dob.addEventListener('input',()=>{
        const dob=new_dob.value;
        const today=new Date();
        const birthDate=new Date(dob);
        let age=today.getFullYear()-birthDate.getFullYear();
        const month=today.getMonth()-birthDate.getMonth();
        
        if (month<0 || (month===0 && today.getDate()<birthDate.getDate())) {
            age--;
        }
        if (age<13) {
            document.getElementById('wrong_dob').style.display='block';
            user.dob='';
        }
        else{
            document.getElementById('wrong_dob').style.display='none';
            user.dob=dob;
            updateButtonColor();
        }
        updateButtonColor();
    });

    signin_button.addEventListener('click', async (e) => {
        e.preventDefault();
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.removeItem('signedOut');
        newAccount_dialog.style.display = 'none';
        backdrop.style.display = 'none';
        logging.style.display = 'flex';
        await sleep(2000);
        log();
        window.location.href = 'index.html';
    });

    const updateLoginButtonColor = () => {
        if (name.value.trim() !== '' && pswd.value.trim() !== '') {
            login_button.style.backgroundColor='#000';
            login_button.style.opacity='1';
            login_button.disabled=false;
        } else {
            login_button.style.backgroundColor='#000';
            login_button.style.opacity='0.5';
            login_button.disabled=true;
        }
    };

    name.addEventListener('input', updateLoginButtonColor);
    pswd.addEventListener('input', updateLoginButtonColor);

    updateLoginButtonColor();


    login_button.addEventListener('click', async (e)=>{
        e.preventDefault();
        let storedUser=JSON.parse(localStorage.getItem('user'));
        
        if (!storedUser) {
            storedUser={
                name:'',
                email:'',
                password:'',
                dob:'',
                uname:'',
                profile_pic:''
            };
        }

        console.log(storedUser);
        
        let enteredName=name.value;
        let enteredPswd=pswd.value;

        if (enteredName !== storedUser.uname && enteredName !== storedUser.email) {
            document.getElementById('wrong_name').style.display='block';
            document.getElementById('wrong_pswd').style.display='none';
        }
        else if (enteredPswd !== storedUser.password) {
            document.getElementById('wrong_name').style.display='none';
            document.getElementById('wrong_pswd').style.display='block';
        }
        else {
            document.getElementById('wrong_name').style.display='none';
            document.getElementById('wrong_pswd').style.display='none';
            localStorage.removeItem('signedOut');
            logging.style.display='flex';
            await sleep(2000);
            log();
            window.location.href='index.html';
        }
    });

    signup_link.addEventListener('click',()=>{
        Signin_dialog.style.display='none';
        newAccount_dialog.style.display='block';
        backdrop.style.display='block';
    });
});

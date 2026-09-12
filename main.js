
const header=document.querySelector('.site-header');
window.addEventListener('scroll',()=>header?.classList.toggle('scrolled',window.scrollY>40));
const toggle=document.querySelector('.menu-toggle');
toggle?.addEventListener('click',()=>document.querySelector('.site-header')?.classList.toggle('open'));
const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')});
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
 const id=a.getAttribute('href'); if(id.length>1){e.preventDefault();document.querySelector(id)?.scrollIntoView({behavior:'smooth'});}
 document.querySelector('.site-header')?.classList.remove('open');
}));

import Image from 'next/image';
import appMobileImg from '../assets/app-mobile.png';
import appUsersAvatarPng from '../assets/app-users-avatar.png';
import appLogoSvg from '../assets/app-logo.svg';
import appCheckSvg from '../assets/app-icon-check.svg';
import { GetStaticProps } from 'next';
import { FormEvent, useRef, useState } from 'react';

interface IHomeProps {
  usersCount: number,
  poolsCount: number,
  guessesCount: number,
}

export default function Home({
  usersCount,
  poolsCount,
  guessesCount
}: IHomeProps) {
  const inputRef = useRef(null);
  const [counts, setCounts] = useState({
    users: usersCount,
    pools: poolsCount,
    guesses: guessesCount
  })

  const onUpdateCounts = async () => {
    const baseURL = "http://localhost:3333";

    const [
      responseUsers,
      responsePools,
      responseGuesses
    ] = await Promise.allSettled([
      fetch(`${baseURL}/users/count`),
      fetch(`${baseURL}/pools/count`),
      fetch(`${baseURL}/guesses/count`),
    ]);
  
    let usersCount = 0;
    if (responseUsers.status === "fulfilled") {
      const { users } = await responseUsers.value.json();
      usersCount = users;
    }
  
    let poolsCount = 0;
    if (responsePools.status === "fulfilled") {
      const { pools } = await responsePools.value.json();
      poolsCount = pools;
    }
    
    let guessesCount = 0;
    if (responseGuesses.status === "fulfilled") {
      const { guesses } = await responseGuesses.value.json();
      guessesCount = guesses;
    }

    setCounts({
      users: usersCount,
      pools: poolsCount,
      guesses: guessesCount
    });
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const title = inputRef.current.value;

    try {
      const response = await fetch('http://localhost:3333/pools', {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
      });

      await onUpdateCounts();
      const { code } = await response.json();
      await navigator.clipboard.writeText(code);

      alert(`
        Bolão ${inputRef.current.value} criado com sucesso, o código 
        foi copiado para a área de transferência.`
      );

      inputRef.current.value = "";
    } catch (error) {
      console.log("error: ", error);
    }
  };

  return (
    <div className='max-w-[1124px] h-screen mx-auto grid gap-28 grid-cols-2 items-center'>
      <main>
        <Image src={appLogoSvg} alt="Logo da aplicação com o texto NLW Copa" />

        <h1 className='mt-14 text-white text-5xl font-bold leading-tight'>
          Crie seu próprio bolão da copa e compartilhe entre amigos!
        </h1>

        <div className='mt-10 flex items-center gap-2'>
          <Image src={appUsersAvatarPng} alt="Imagem de usuários" />
          <span className='text-ignite-500 text-xl'>
            +{counts.users} 
            <strong className='text-gray-100 ml-1'>
              pessoas já estão usando
            </strong>
          </span>
        </div>

        <div>
          <form onSubmit={handleSubmit} className='mt-10 flex gap-2'>
            <input
              ref={inputRef}
              className='flex-1 px-6 py-4 rounded bg-gray-800 border border-gray-600 text-sm text-gray-100'
              placeholder="Qual o nome do seu bolão?"
              type="text"
              required
            />
            <button
              type='submit'
              className='bg-yellow-500 px-6 py-4 rounded text-gray-900 font-bold text-sm uppercase hover:bg-yellow-700 duration-200'
            >
              Criar meu bolão
            </button>
          </form>

          <p className='mt-4 text-sm leading-5 text-gray-300'>
            Após criar seu bolão, você receberá um código único que poderá usar para convidar outras pessoas 🚀
          </p>
        </div>

        <div className='mt-10 pt-10 border-t border-gray-600 flex justify-between'>
          <div className='flex'>
            <Image
              className='mr-6'
              src={appCheckSvg} 
              alt="Icone de check" 
            />
            <div>
              <strong className='block text-gray-100 text-2xl leading-snug'>+{counts.pools}</strong>
              <small className='text-base leading-relaxed text-gray-100'>Bolões criados</small>
            </div>
          </div>

          <span className='border-r border-gray-600'/>

          <div className='flex'>
            <Image
              className='mr-6'
              src={appCheckSvg} 
              alt="Icone de check" 
            />
            <div>
              <strong className='block text-gray-100 text-2xl leading-snug'>+{counts.guesses}</strong>
              <small className='text-base leading-relaxed text-gray-100'>Palpites enviados</small>
            </div>
          </div>
        </div>
      </main>
      <Image src={appMobileImg} alt="Dois celulares exibindo uma prévia da aplicação móvel do NLW" />
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const baseURL = "http://localhost:3333";

  const [
    responseUsers,
    responsePools,
    responseGuesses
  ] = await Promise.allSettled([
    fetch(`${baseURL}/users/count`),
    fetch(`${baseURL}/pools/count`),
    fetch(`${baseURL}/guesses/count`),
  ]);

  let usersCount = 0;
  if (responseUsers.status === "fulfilled") {
    const { users } = await responseUsers.value.json();
    usersCount = users;
  }

  let poolsCount = 0;
  if (responsePools.status === "fulfilled") {
    const { pools } = await responsePools.value.json();
    poolsCount = pools;
  }
  
  let guessesCount = 0;
  if (responseGuesses.status === "fulfilled") {
    const { guesses } = await responseGuesses.value.json();
    guessesCount = guesses;
  }

  return {
    props: {
      usersCount,
      poolsCount,
      guessesCount
    },

    revalidate: 24*60*60
  }
}

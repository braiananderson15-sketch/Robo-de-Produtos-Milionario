"use client";
import Link from "next/link";
import type { ComponentType } from "react";
import { Moldura } from "@/components/Moldura";
import { Disco } from "@/components/Disco";
import { AgendaSemana } from "@/components/AgendaSemana";
import { Preco } from "@/components/Preco";
import {
  IconeSeta,
  IconeCheck,
  IconeCadeado,
  IconeProdutos,
  IconeAgenda,
  IconeMapa,
  IconeMensagem,
} from "@/components/Icones";
import { useDados } from "@/lib/armazenamento";
import {
  calcularNumeros,
  primeiroNome,
  diaPessoal,
} from "@/lib/numerologia/calculo";
import { tituloNaFrase, DIA } from "@/lib/numerologia/significados";
import { formatarPreco } from "@/lib/produtoModelo";
function Ferramenta({
  href,
  titulo,
  texto,
  trancada = false,
  contador,
  Icone,
}: {
  href: string;
  titulo: string;
  texto: string;
  trancada?: boolean;
  contador?: number;
  Icone: ComponentType<{ size?: number }>;
}) {
  return (
    <Link
      href={href}
      className={"card ferramenta " + (trancada ? "trancada" : "")}
    >
      <span className="icone">
        {trancada ? <IconeCadeado size={16} /> : <Icone size={20} />}
      </span>
      {!!contador && <span className="contador cromo">{contador}</span>}
      <h3>{titulo}</h3>
      <p>{trancada ? "Abre depois do seu número" : texto}</p>
    </Link>
  );
}
export default function Inicio() {
  const { dados, pronto } = useDados();
  if (!pronto) return <div className="shell" />;
  const { perfil, produtos } = dados,
    numeros = perfil
      ? calcularNumeros(perfil.nome, perfil.dia, perfil.mes)
      : null,
    ultimo = produtos[0],
    agora = new Date(),
    hora = agora.getHours(),
    n = numeros ? diaPessoal(numeros.anoColheita, agora) : 0;
  return (
    <Moldura>
      <section className="saudacao entrar">
        <h1 className="display">
          {perfil
            ? `${hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite"}, ${primeiroNome(perfil.nome)}`
            : "Boas-vindas ao seu cofre"}
        </h1>
        <p className="lead">
          {perfil
            ? "O seu número já está calculado. Escolha por onde quer seguir hoje."
            : "Tudo o que você precisa para transformar o que já sabe fazer num primeiro produto."}
        </p>
      </section>
      <div className="painel-grade">
        <div className="coluna">
          {numeros ? (
            <section className="card-destaque heroi entrar">
              <p className="kicker">Seu Número que Vende</p>
              <div className="heroi-num">
                <span className="numero-grande cromo">{numeros.oficio}</span>
                <p>
                  <span>Número de Ofício</span>o Número de{" "}
                  {tituloNaFrase(numeros.oficio)}
                </p>
              </div>
              <div className="acoes-heroi">
                <Link
                  href="/numero-que-vende#talentos"
                  className="btn btn-acao"
                >
                  Montar um novo produto
                </Link>
                <Link href="/mapa" className="btn btn-contorno">
                  Ver o meu mapa
                </Link>
              </div>
            </section>
          ) : (
            <section className="card-destaque heroi entrar">
              <div className="heroi-topo">
                <div>
                  <p className="kicker">Número que Vende</p>
                  <h2>
                    Descubra o que você já sabe fazer que pode virar dinheiro
                  </h2>
                  <p>
                    O seu nome mostra o seu Número de Ofício. Em 2 minutos você
                    sai com um produto pronto para oferecer no WhatsApp.
                  </p>
                </div>
                <Disco tamanho={104} />
              </div>
              <div className="etapas">
                <span>
                  <b>1</b>Nome e data
                </span>
                <span>
                  <b>2</b>O que você sabe fazer
                </span>
                <span>
                  <b>3</b>Produto pronto
                </span>
              </div>
              <Link href="/numero-que-vende" className="btn btn-acao">
                Descobrir o meu número
                <IconeSeta />
              </Link>
              <div className="confianca">
                <span>
                  <IconeCheck size={14} />
                  Leva 2 minutos
                </span>
                <span>
                  <IconeCheck size={14} />
                  Sem senha
                </span>
                <span>
                  <IconeCadeado size={13} />
                  Fica salvo no seu celular
                </span>
              </div>
            </section>
          )}
          <p className="ornamento">Ferramentas do cofre</p>
          <div className="grade">
            <Ferramenta
              href="/produtos"
              titulo="Meus Produtos"
              texto={
                produtos.length
                  ? "Os produtos que você já montou"
                  : "Nenhum ainda"
              }
              contador={produtos.length}
              Icone={IconeProdutos}
            />
            <Ferramenta
              href={numeros ? "/agenda" : "/numero-que-vende"}
              titulo="Agenda da Colheita"
              texto="Os melhores dias para anunciar"
              trancada={!numeros}
              Icone={IconeAgenda}
            />
            <Ferramenta
              href={numeros ? "/mapa" : "/numero-que-vende"}
              titulo="Meu Mapa"
              texto="Seus 3 números e como chegamos neles"
              trancada={!numeros}
              Icone={IconeMapa}
            />
            <Ferramenta
              href={ultimo ? `/resultado#${ultimo.id}` : "/numero-que-vende"}
              titulo="Mensagens Prontas"
              texto="Status, grupo e privado"
              trancada={!ultimo}
              Icone={IconeMensagem}
            />
          </div>
        </div>
        <div className="coluna coluna-lado">
          {numeros ? (
            <>
              <div className="sec-titulo">
                <h2>Hoje</h2>
              </div>
              <div className="card hoje">
                <span className="num-serif cromo">{n}</span>
                <p>
                  {DIA[n]}
                  <small>
                    {
                      [
                        "domingo",
                        "segunda-feira",
                        "terça-feira",
                        "quarta-feira",
                        "quinta-feira",
                        "sexta-feira",
                        "sábado",
                      ][agora.getDay()]
                    }{" "}
                    {agora.getDate()}
                  </small>
                </p>
                {[1, 3, 5, 8].includes(n) && (
                  <span className="selo">Bom para anunciar</span>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="sec-titulo">
                <h2>Como funciona</h2>
              </div>
              <div className="card como" style={{ padding: 18, marginTop: 0 }}>
                <div>
                  <b>1</b>
                  <p>
                    <strong>Digite o seu nome e a data.</strong> O app calcula o
                    seu número letra por letra.
                  </p>
                </div>
                <div>
                  <b>2</b>
                  <p>
                    <strong>Marque o que te pedem sempre.</strong> Bolo, unha,
                    reforço escolar, conselho...
                  </p>
                </div>
                <div>
                  <b>3</b>
                  <p>
                    <strong>Receba o produto pronto.</strong> Nome, preço de
                    exemplo e mensagens para o WhatsApp.
                  </p>
                </div>
              </div>
            </>
          )}
          {ultimo && (
            <>
              <div className="sec-titulo">
                <h2>Seu último produto</h2>
                <Link href="/produtos">Ver todos</Link>
              </div>
              <Link href={`/resultado#${ultimo.id}`} className="card ultimo">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3>{ultimo.nomeProduto}</h3>
                  <small>
                    Preço de exemplo{" "}
                    <Preco texto={formatarPreco(ultimo.precoExemplo)} />
                  </small>
                </div>
                <IconeSeta />
              </Link>
            </>
          )}
          {numeros && (
            <>
              <div className="sec-titulo">
                <h2>Sua semana</h2>
                <Link href="/agenda">Abrir agenda</Link>
              </div>
              <AgendaSemana ano={numeros.anoColheita} />
            </>
          )}
        </div>
      </div>
    </Moldura>
  );
}

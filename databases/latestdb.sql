--
-- PostgreSQL database dump
--

\restrict gMJz4x9qLAdCwRKveuBpoBih8lisD4AmivyfAZ969srWkf6axABiklIrzvbmxcT

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-03-12 14:54:15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 16404)
-- Name: devices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.devices (
    id integer NOT NULL,
    user_id integer NOT NULL,
    device_id text NOT NULL,
    device_name text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.devices OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16403)
-- Name: devices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.devices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.devices_id_seq OWNER TO postgres;

--
-- TOC entry 5085 (class 0 OID 0)
-- Dependencies: 221
-- Name: devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.devices_id_seq OWNED BY public.devices.id;


--
-- TOC entry 226 (class 1259 OID 16441)
-- Name: otp_verifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.otp_verifications (
    id integer NOT NULL,
    email character varying(255),
    expires_at timestamp with time zone NOT NULL,
    phone character varying(15),
    identifier text NOT NULL,
    otp_hash text NOT NULL,
    attempts integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    verified boolean DEFAULT false,
    CONSTRAINT otp_attempt_limit CHECK ((attempts <= 5))
);


ALTER TABLE public.otp_verifications OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16440)
-- Name: otp_verifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.otp_verifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.otp_verifications_id_seq OWNER TO postgres;

--
-- TOC entry 5086 (class 0 OID 0)
-- Dependencies: 225
-- Name: otp_verifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.otp_verifications_id_seq OWNED BY public.otp_verifications.id;


--
-- TOC entry 224 (class 1259 OID 16415)
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token text NOT NULL,
    device_id text,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone NOT NULL,
    revoked boolean DEFAULT false,
    jti character varying(255),
    session_id uuid
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16414)
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refresh_tokens_id_seq OWNER TO postgres;

--
-- TOC entry 5087 (class 0 OID 0)
-- Dependencies: 223
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- TOC entry 227 (class 1259 OID 16705)
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id uuid NOT NULL,
    user_id integer NOT NULL,
    device_id text,
    ip_address text,
    user_agent text,
    revoked boolean DEFAULT false,
    last_used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16390)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50),
    password text,
    role character varying(20),
    region character varying(50),
    depot character varying(50),
    device_id text,
    mfa_enabled boolean DEFAULT true NOT NULL,
    is_active boolean DEFAULT true,
    email text,
    mobile_number character varying(15),
    failed_login_attempts integer DEFAULT 0,
    account_locked_until timestamp with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16389)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5088 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4879 (class 2604 OID 16407)
-- Name: devices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices ALTER COLUMN id SET DEFAULT nextval('public.devices_id_seq'::regclass);


--
-- TOC entry 4884 (class 2604 OID 16444)
-- Name: otp_verifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.otp_verifications ALTER COLUMN id SET DEFAULT nextval('public.otp_verifications_id_seq'::regclass);


--
-- TOC entry 4881 (class 2604 OID 16418)
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- TOC entry 4875 (class 2604 OID 16393)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5074 (class 0 OID 16404)
-- Dependencies: 222
-- Data for Name: devices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.devices (id, user_id, device_id, device_name, created_at) FROM stdin;
9	15	BP2A.250605.031.A3	Flutter Device	2026-03-12 12:03:08.993347+05:30
\.


--
-- TOC entry 5078 (class 0 OID 16441)
-- Dependencies: 226
-- Data for Name: otp_verifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.otp_verifications (id, email, expires_at, phone, identifier, otp_hash, attempts, created_at, verified) FROM stdin;
\.


--
-- TOC entry 5076 (class 0 OID 16415)
-- Dependencies: 224
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, user_id, token, device_id, created_at, expires_at, revoked, jti, session_id) FROM stdin;
54	15	cbbd534fba14bbb83cccae92fd60917e401fcd635306ab12f79f91adad8de632	\N	2026-03-12 13:01:56.510542+05:30	2026-03-19 13:01:56.510542+05:30	f	d65e29d1-0f77-46f8-af90-6029967e1b68	03e217c7-c56d-43da-8c0e-81b231c54280
55	15	3cc3a65426b9ca56169bd8e04ce5339b72a120ffec0041766bcacfe3ba951d9b	\N	2026-03-12 14:51:24.173392+05:30	2026-03-19 14:51:24.173392+05:30	f	8c3ec219-f32b-4c7b-80e3-f6b608f7f0d4	47d737e8-9aa5-4c2c-9347-a39ac753dbbc
\.


--
-- TOC entry 5079 (class 0 OID 16705)
-- Dependencies: 227
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, user_id, device_id, ip_address, user_agent, revoked, last_used_at, created_at, expires_at) FROM stdin;
69193b96-7611-4028-ac62-263da7e50ad6	15	BP2A.250605.031.A3	192.168.0.164	Dart/3.11 (dart:io)	t	2026-03-12 12:55:48.195751+05:30	2026-03-12 12:52:50.858913+05:30	2026-03-19 12:52:50.858913+05:30
f879f920-ee5c-419a-9b4e-da9acdc1e784	15	BP2A.250605.031.A3	192.168.0.164	Dart/3.11 (dart:io)	t	2026-03-12 12:56:47.233936+05:30	2026-03-12 12:56:24.485134+05:30	2026-03-19 12:56:24.485134+05:30
c8442136-9ac4-48f1-a880-2dc3a93011fc	15	BP2A.250605.031.A3	192.168.0.164	Dart/3.11 (dart:io)	t	2026-03-12 13:00:28.566241+05:30	2026-03-12 12:58:53.768285+05:30	2026-03-19 12:58:53.768285+05:30
03e217c7-c56d-43da-8c0e-81b231c54280	15	BP2A.250605.031.A3	192.168.0.164	Dart/3.11 (dart:io)	f	\N	2026-03-12 13:01:56.510542+05:30	2026-03-19 13:01:56.510542+05:30
47d737e8-9aa5-4c2c-9347-a39ac753dbbc	15	BP2A.250605.031.A3	192.168.0.164	Dart/3.11 (dart:io)	f	\N	2026-03-12 14:51:24.173392+05:30	2026-03-19 14:51:24.173392+05:30
\.


--
-- TOC entry 5072 (class 0 OID 16390)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, role, region, depot, device_id, mfa_enabled, is_active, email, mobile_number, failed_login_attempts, account_locked_until) FROM stdin;
15	manishkumar	$2b$12$2kJLC9ozEDkjcEQmQG4ux.wrg9rkudDPyIyIIm2xwYQ0Mcnu0s/Ji	Command Center	Mumbai	Thane	BP2A.250605.031.A3	t	t	manishkumar373000@gmail.com	+918828168700	0	\N
\.


--
-- TOC entry 5089 (class 0 OID 0)
-- Dependencies: 221
-- Name: devices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.devices_id_seq', 9, true);


--
-- TOC entry 5090 (class 0 OID 0)
-- Dependencies: 225
-- Name: otp_verifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.otp_verifications_id_seq', 59, true);


--
-- TOC entry 5091 (class 0 OID 0)
-- Dependencies: 223
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 55, true);


--
-- TOC entry 5092 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 15, true);


--
-- TOC entry 4901 (class 2606 OID 16413)
-- Name: devices devices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_pkey PRIMARY KEY (id);


--
-- TOC entry 4912 (class 2606 OID 16807)
-- Name: otp_verifications otp_identifier_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.otp_verifications
    ADD CONSTRAINT otp_identifier_unique UNIQUE (identifier);


--
-- TOC entry 4914 (class 2606 OID 16452)
-- Name: otp_verifications otp_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.otp_verifications
    ADD CONSTRAINT otp_verifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4919 (class 2606 OID 16716)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4909 (class 2606 OID 16703)
-- Name: refresh_tokens unique_jti; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT unique_jti UNIQUE (jti);


--
-- TOC entry 4893 (class 2606 OID 16460)
-- Name: users unique_mobile; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_mobile UNIQUE (mobile_number);


--
-- TOC entry 4904 (class 2606 OID 16551)
-- Name: devices unique_user_device; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT unique_user_device UNIQUE (user_id, device_id);


--
-- TOC entry 4895 (class 2606 OID 16468)
-- Name: users unique_username; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_username UNIQUE (username);


--
-- TOC entry 4897 (class 2606 OID 16433)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4899 (class 2606 OID 16400)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4902 (class 1259 OID 16552)
-- Name: idx_devices_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_devices_user ON public.devices USING btree (user_id);


--
-- TOC entry 4910 (class 1259 OID 16510)
-- Name: idx_otp_identifier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_otp_identifier ON public.otp_verifications USING btree (identifier);


--
-- TOC entry 4905 (class 1259 OID 16534)
-- Name: idx_refresh_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_token ON public.refresh_tokens USING btree (token);


--
-- TOC entry 4906 (class 1259 OID 16704)
-- Name: idx_refresh_tokens_jti; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_jti ON public.refresh_tokens USING btree (jti);


--
-- TOC entry 4907 (class 1259 OID 16535)
-- Name: idx_refresh_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_user ON public.refresh_tokens USING btree (user_id);


--
-- TOC entry 4915 (class 1259 OID 16723)
-- Name: idx_sessions_device; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_device ON public.sessions USING btree (device_id);


--
-- TOC entry 4916 (class 1259 OID 16749)
-- Name: idx_sessions_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_expires ON public.sessions USING btree (expires_at);


--
-- TOC entry 4917 (class 1259 OID 16722)
-- Name: idx_sessions_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_user ON public.sessions USING btree (user_id);


--
-- TOC entry 4891 (class 1259 OID 16434)
-- Name: idx_users_login; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_login ON public.users USING btree (username, email);


--
-- TOC entry 4920 (class 2606 OID 16544)
-- Name: devices fk_devices_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT fk_devices_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4921 (class 2606 OID 16725)
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id);


--
-- TOC entry 4922 (class 2606 OID 16427)
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4923 (class 2606 OID 16717)
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-03-12 14:54:15

--
-- PostgreSQL database dump complete
--

\unrestrict gMJz4x9qLAdCwRKveuBpoBih8lisD4AmivyfAZ969srWkf6axABiklIrzvbmxcT


USE [master]
GO
/****** Object:  Database [Ooo]    Script Date: 7/17/2014 11:59:44 PM ******/
CREATE DATABASE [Ooo]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'Ooo', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL12.SQLEXPRESS\MSSQL\DATA\Ooo.mdf' , SIZE = 3072KB , MAXSIZE = UNLIMITED, FILEGROWTH = 1024KB )
 LOG ON 
( NAME = N'Ooo_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL12.SQLEXPRESS\MSSQL\DATA\Ooo_log.ldf' , SIZE = 1024KB , MAXSIZE = 2048GB , FILEGROWTH = 10%)
GO
ALTER DATABASE [Ooo] SET COMPATIBILITY_LEVEL = 120
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [Ooo].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [Ooo] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [Ooo] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [Ooo] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [Ooo] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [Ooo] SET ARITHABORT OFF 
GO
ALTER DATABASE [Ooo] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [Ooo] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [Ooo] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [Ooo] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [Ooo] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [Ooo] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [Ooo] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [Ooo] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [Ooo] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [Ooo] SET  DISABLE_BROKER 
GO
ALTER DATABASE [Ooo] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [Ooo] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [Ooo] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [Ooo] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [Ooo] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [Ooo] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [Ooo] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [Ooo] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [Ooo] SET  MULTI_USER 
GO
ALTER DATABASE [Ooo] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [Ooo] SET DB_CHAINING OFF 
GO
ALTER DATABASE [Ooo] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [Ooo] SET TARGET_RECOVERY_TIME = 0 SECONDS 
GO
ALTER DATABASE [Ooo] SET DELAYED_DURABILITY = DISABLED 
GO
USE [Ooo]
GO
/****** Object:  User [test]    Script Date: 7/17/2014 11:59:44 PM ******/
CREATE USER [test] FOR LOGIN [test] WITH DEFAULT_SCHEMA=[dbo]
GO
ALTER ROLE [db_owner] ADD MEMBER [test]
GO
/****** Object:  Table [dbo].[characters]    Script Date: 7/17/2014 11:59:44 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[characters](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[first_name] [varchar](255) NULL,
	[last_name] [varchar](255) NULL,
	[age] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[effects]    Script Date: 7/17/2014 11:59:44 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[effects](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[item_id] [int] NULL,
	[stat] [varchar](255) NULL,
	[modifier] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[items]    Script Date: 7/17/2014 11:59:44 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[items](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[character_id] [int] NULL,
	[name] [varchar](255) NULL,
	[type] [varchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
SET IDENTITY_INSERT [dbo].[characters] ON 

GO
INSERT [dbo].[characters] ([id], [first_name], [last_name], [age]) VALUES (1, N'Finn', N'The Human', 14)
GO
INSERT [dbo].[characters] ([id], [first_name], [last_name], [age]) VALUES (2, N'Jake', N'The Dog', 28)
GO
INSERT [dbo].[characters] ([id], [first_name], [last_name], [age]) VALUES (3, N'Princess', N'Bubblegum', 827)
GO
INSERT [dbo].[characters] ([id], [first_name], [last_name], [age]) VALUES (4, N'Marceline', N'Abadeer', 1004)
GO
SET IDENTITY_INSERT [dbo].[characters] OFF
GO
SET IDENTITY_INSERT [dbo].[effects] ON 

GO
INSERT [dbo].[effects] ([id], [item_id], [stat], [modifier]) VALUES (1, 1, N'luck', 2)
GO
INSERT [dbo].[effects] ([id], [item_id], [stat], [modifier]) VALUES (2, 3, N'damage', 2)
GO
INSERT [dbo].[effects] ([id], [item_id], [stat], [modifier]) VALUES (3, 3, N'charisma', -1)
GO
INSERT [dbo].[effects] ([id], [item_id], [stat], [modifier]) VALUES (4, 3, N'damage_holy', 4)
GO
INSERT [dbo].[effects] ([id], [item_id], [stat], [modifier]) VALUES (5, 4, N'damage', 3)
GO
INSERT [dbo].[effects] ([id], [item_id], [stat], [modifier]) VALUES (6, 4, N'speed', 2)
GO
INSERT [dbo].[effects] ([id], [item_id], [stat], [modifier]) VALUES (7, 6, N'charisma', 2)
GO
INSERT [dbo].[effects] ([id], [item_id], [stat], [modifier]) VALUES (8, 6, N'luck', 1)
GO
SET IDENTITY_INSERT [dbo].[effects] OFF
GO
SET IDENTITY_INSERT [dbo].[items] ON 

GO
INSERT [dbo].[items] ([id], [character_id], [name], [type]) VALUES (1, 1, N'Golden Sword of Battle', N'sword')
GO
INSERT [dbo].[items] ([id], [character_id], [name], [type]) VALUES (2, 1, N'Root Sword', N'sword')
GO
INSERT [dbo].[items] ([id], [character_id], [name], [type]) VALUES (3, 1, N'Demon Blood Sword', N'sword')
GO
INSERT [dbo].[items] ([id], [character_id], [name], [type]) VALUES (4, 1, N'Grass Sword', N'sword')
GO
INSERT [dbo].[items] ([id], [character_id], [name], [type]) VALUES (5, 1, N'Finn''s Hat', N'headgear')
GO
INSERT [dbo].[items] ([id], [character_id], [name], [type]) VALUES (6, 2, N'viola', N'musical_instrument')
GO
SET IDENTITY_INSERT [dbo].[items] OFF
GO
USE [master]
GO
ALTER DATABASE [Ooo] SET  READ_WRITE 
GO
